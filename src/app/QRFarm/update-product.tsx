import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { addProductBlock, getProduct } from '@/services/api';

interface ProductBlock {
  blockId: number;
  timestamp: number;
  actor: string;
  actorType: 'producer' | 'importer' | 'trader' | 'retailer' | 'other';
  location: string;
  data: any;
  prevHash: string;
  hash: string;
}

interface ChildProductData {
  id: string;
  parentId: string;
  weight: number;
  size: string;
  quality: string; 
  additionalNotes: string;
  blocks: ProductBlock[];
}

export default function UpdateProductScreen() {
  const params = useLocalSearchParams();
  const productId = params.productId as string;
  
  const [product, setProduct] = useState<ChildProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for the new block
  const [formData, setFormData] = useState({
    actorType: '',
    actor: '',
    location: '',
    details: '',
  });

  useFocusEffect(
    useCallback(() => {
      console.log('Update product screen focused with ID:', productId);
      
      // Reset form state
      setFormData({
        actorType: '',
        actor: '',
        location: '',
        details: '',
      });
      
      // Reset data states
      setProduct(null);
      setError(null);
      
      // Fetch fresh data
      fetchProductData();
      
      return () => {
        // Any cleanup if needed
      };
    }, [productId])
  );

  const fetchProductData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get product data from the API
      const productData = await getProduct(productId);
      setProduct(productData);
    } catch (e) {
      console.error('Error fetching product:', e);
      setError('Failed to load product data. Please check your connection.');
      
      // Fallback to mock data for demo purposes if API fails
      if (Platform.OS !== 'web') {
        const mockProduct = createMockProduct(productId);
        setProduct(mockProduct);
      }
    } finally {
      setLoading(false);
    }
  };

  const createMockProduct = (id: string): ChildProductData => {
    // Create a mock product for testing on mobile
    return {
      id,
      parentId: 'BATCH-MOCK-001',
      weight: 2.5,
      size: '10x15',
      quality: 'A',
      additionalNotes: 'Mock product for testing updates',
      blocks: [
        {
          blockId: 0,
          timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
          actor: 'Farmer Joe',
          actorType: 'producer',
          location: 'Farm Valley',
          data: {
            productDetails: {
              weight: 2.5,
              size: '10x15',
              quality: 'A',
            },
            notes: 'Freshly harvested',
          },
          prevHash: '0',
          hash: 'mock-hash-123'
        }
      ]
    };
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateHash = (blockId: number, prevHash: string, data: string) => {
    const dataToHash = `${blockId}:${prevHash}:${data}:${Date.now()}`;
    // This is a simplified hash for demo. Use a proper hash function in production
    return Array.from(dataToHash)
        .reduce((hash, char) => {
            const charCode = char.charCodeAt(0);
            hash = (hash ^ (charCode + ((hash << 5) - hash))) | 0; // force int32
            return hash;
        }, 0)
        .toString(16);
  };

  const handleUpdateProduct = () => {
    // Validate the form fields
    if (!formData.actorType || !formData.actor || !formData.location || !formData.details) {
      Alert.alert('Missing Information', 'Please fill in all fields before updating.');
      return;
    }

    if (!product) {
      Alert.alert('Error', 'Product data not available.');
      return;
    }

    try {
      // Get the last block in the chain
      const lastBlock = product.blocks[product.blocks.length - 1];
      const newBlockId = lastBlock.blockId + 1;
      const prevHash = lastBlock.hash;
      
      // Create new block data
      const newBlockData = {
        action: formData.actorType,
        details: formData.details,
      };
      
      // Calculate hash for the new block
      const newHash = calculateHash(newBlockId, prevHash, JSON.stringify(newBlockData));
      
      // Create the new block
      const newBlock: ProductBlock = {
        blockId: newBlockId,
        timestamp: Date.now(),
        actor: formData.actor,
        actorType: formData.actorType as any,
        location: formData.location,
        data: newBlockData,
        prevHash: prevHash,
        hash: newHash
      };
      
      // Save the new block to the database via API
      addProductBlock(productId, newBlock)
        .then(() => {
          // Provide haptic feedback on success
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          
          // Show success message and navigate back
          Alert.alert(
            'Product Updated',
            'The product journey has been successfully updated.',
            [{ 
              text: 'OK', 
              onPress: () => router.navigate('/QRFarm')
            }]
          );
        })
        .catch(error => {
          console.error('API error updating product:', error);
          Alert.alert('Error', 'Failed to update product information. Please try again.');
        });
    } catch (e) {
      console.error('Error updating product:', e);
      Alert.alert('Error', 'Failed to update product information. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <Ionicons name="hourglass-outline" size={40} color="#557089" />
          <ThemedText style={styles.loadingText}>Loading product data...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#557089" />
          <ThemedText style={styles.errorTitle}>Error</ThemedText>
          <ThemedText style={styles.errorText}>{error || 'Product not found'}</ThemedText>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => router.navigate('/QRFarm')}
          >
            <ThemedText style={styles.buttonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  // Get product details from the first block (producer data)
  const initialBlock = product.blocks[0];
  const productDetails = initialBlock.data.productDetails;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          
          <ThemedView style={styles.header}>
            <ThemedText style={styles.productId}>
              <Ionicons name="barcode-outline" size={16} color="#557089" /> {productId}
            </ThemedText>
          </ThemedView>
          
          {/* Product summary */}
          <ThemedView style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="cube-outline" size={22} color="#557089" />
              <ThemedText style={styles.cardTitle}>Product Summary</ThemedText>
            </View>
            
            <View style={styles.productDetail}>
              <ThemedText style={styles.detailLabel}>Weight:</ThemedText>
              <ThemedText style={styles.qualityText}>{productDetails.weight} kg</ThemedText>
            </View>
            <View style={styles.productDetail}>
              <ThemedText style={styles.detailLabel}>Size:</ThemedText>
              <ThemedText style={styles.qualityText}>{productDetails.size}</ThemedText>
            </View>
            <View style={styles.productDetail}>
              <ThemedText style={styles.detailLabel}>Quality:</ThemedText>
              <View style={styles.qualityBadge}>
                <ThemedText style={styles.qualityText}>{productDetails.quality}</ThemedText>
              </View>
            </View>
            <View style={styles.productDetail}>
              <ThemedText style={styles.detailLabel}>Journey Steps:</ThemedText>
              <View style={styles.stepCounter}>
                <ThemedText style={styles.stepCountText}>{product.blocks.length}</ThemedText>
              </View>
            </View>
          </ThemedView>
          
          {/* Timeline */}
          <ThemedView style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="time-outline" size={22} color="#557089" />
              <ThemedText style={styles.cardTitle}>Journey Timeline</ThemedText>
            </View>
            
            <View style={styles.timeline}>
              {product.blocks.map((block, index) => (
                <View key={block.blockId} style={styles.timelineItem}>
                  <View style={styles.timelineDot}>
                    {index === 0 && <Ionicons name="leaf-outline" size={16} color="white" />}
                    {index !== 0 && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                  
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeader}>
                      <ThemedText style={styles.timelineActor}>{block.actor}</ThemedText>
                      <ThemedText style={styles.timelineDate}>
                        {new Date(block.timestamp).toLocaleDateString()}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.timelineRole}>{block.actorType}</ThemedText>
                    <ThemedText style={styles.timelineLocation}>
                      <Ionicons name="location-outline" size={14} color="#557089" /> {block.location}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </ThemedView>
          
          {/* Update form */}
          <ThemedView style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="add-circle-outline" size={22} color="#557089" />
              <ThemedText style={styles.cardTitle}>Add to Journey</ThemedText>
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Your Role *</ThemedText>
              <View style={styles.pickerContainer}>
                {['importer', 'trader', 'retailer', 'other'].map((role) => (
                  <TouchableOpacity 
                    key={role}
                    style={[
                      styles.rolePill, 
                      formData.actorType === role && styles.selectedRole
                    ]}
                    onPress={() => updateField('actorType', role)}
                  >
                    <ThemedText 
                      style={formData.actorType === role ? styles.selectedRoleText : styles.roleText}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Your Name/Company *</ThemedText>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#557089" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.actor}
                  onChangeText={(text) => updateField('actor', text)}
                  placeholder="Enter your name or company"
                  placeholderTextColor="#8A8A8A"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Current Location *</ThemedText>
              <View style={styles.inputWrapper}>
                <Ionicons name="location-outline" size={20} color="#557089" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.location}
                  onChangeText={(text) => updateField('location', text)}
                  placeholder="Enter current location"
                  placeholderTextColor="#8A8A8A"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Action Details *</ThemedText>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={styles.textArea}
                  value={formData.details}
                  onChangeText={(text) => updateField('details', text)}
                  placeholder="Describe what you did with the product (e.g., imported, packaged, transported)"
                  placeholderTextColor="#8A8A8A"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </ThemedView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.secondaryButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleUpdateProduct}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.buttonText}>Update Journey</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B0C756',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  backButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#557089',
    marginLeft: 16,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#557089',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#557089',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  header: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  productId: {
    fontWeight: '500',
    color: '#557089',
    fontSize: 16,
  },
  card: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(176, 199, 86, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#557089',
  },
  productDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 110,
    color: '#557089',
  },
  qualityBadge: {
    backgroundColor: 'rgba(176, 199, 86, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  qualityText: {
    fontWeight: '600',
    color: '#557089',
  },
  stepCounter: {
    backgroundColor: '#557089',
    height: 24,
    width: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCountText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  timeline: {
    marginTop: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#B0C756',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: 'rgba(176, 199, 86, 0.08)',
    padding: 12,
    borderRadius: 12,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timelineActor: {
    fontWeight: '600',
    color: '#557089',
  },
  timelineDate: {
    fontSize: 12,
    color: '#666',
  },
  timelineRole: {
    fontSize: 14,
    color: '#557089',
    fontStyle: 'italic',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  timelineLocation: {
    fontSize: 14,
    color: '#666',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#557089',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(176, 199, 86, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  inputIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  textAreaWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(176, 199, 86, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  textArea: {
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },
  rolePill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(176, 199, 86, 0.3)',
    backgroundColor: 'white',
    marginBottom: 8,
  },
  selectedRole: {
    backgroundColor: '#557089',
    borderColor: '#557089',
  },
  roleText: {
    color: '#557089',
  },
  selectedRoleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#557089',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#557089',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#557089',
    fontWeight: '600',
    fontSize: 16,
  }
});