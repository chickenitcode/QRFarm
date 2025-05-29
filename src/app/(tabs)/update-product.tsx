import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
              onPress: () => router.navigate('/(tabs)')
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
        <ThemedView style={styles.centered}>
          <ThemedText>Loading product data...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.centered}>
          <ThemedText type="title" style={styles.errorTitle}>Error</ThemedText>
          <ThemedText style={styles.errorText}>{error || 'Product not found'}</ThemedText>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => router.navigate('/(tabs)')}
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
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          
          <ThemedView style={styles.header}>
            <ThemedText type="title">Update Product</ThemedText>
            <ThemedText style={styles.productId}>
              Product ID: {productId}
            </ThemedText>
          </ThemedView>
          
          {/* Product summary */}
          <ThemedView style={styles.summaryCard}>
            <ThemedText style={styles.cardTitle}>Product Summary</ThemedText>
            <View style={styles.productDetail}>
              <ThemedText style={styles.detailLabel}>Weight:</ThemedText>
              <ThemedText>{productDetails.weight} kg</ThemedText>
            </View>
            <View style={styles.productDetail}>
              <ThemedText style={styles.detailLabel}>Size:</ThemedText>
              <ThemedText>{productDetails.size}</ThemedText>
            </View>
            <View style={styles.productDetail}>
              <ThemedText style={styles.detailLabel}>Quality:</ThemedText>
              <ThemedText>{productDetails.quality}</ThemedText>
            </View>
            <View style={styles.productDetail}>
              <ThemedText style={styles.detailLabel}>Journey Steps:</ThemedText>
              <ThemedText>{product.blocks.length}</ThemedText>
            </View>
          </ThemedView>
          
          {/* Update form */}
          <ThemedView style={styles.formCard}>
            <ThemedText style={styles.cardTitle}>Add to Journey</ThemedText>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Your Role *</ThemedText>
              <View style={styles.pickerContainer}>
                <TouchableOpacity 
                  style={[
                    styles.rolePill, 
                    formData.actorType === 'importer' && styles.selectedRole
                  ]}
                  onPress={() => updateField('actorType', 'importer')}
                >
                  <ThemedText style={formData.actorType === 'importer' ? styles.selectedRoleText : {}}>
                    Importer
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.rolePill, 
                    formData.actorType === 'trader' && styles.selectedRole
                  ]}
                  onPress={() => updateField('actorType', 'trader')}
                >
                  <ThemedText style={formData.actorType === 'trader' ? styles.selectedRoleText : {}}>
                    Trader
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.rolePill, 
                    formData.actorType === 'retailer' && styles.selectedRole
                  ]}
                  onPress={() => updateField('actorType', 'retailer')}
                >
                  <ThemedText style={formData.actorType === 'retailer' ? styles.selectedRoleText : {}}>
                    Retailer
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.rolePill, 
                    formData.actorType === 'other' && styles.selectedRole
                  ]}
                  onPress={() => updateField('actorType', 'other')}
                >
                  <ThemedText style={formData.actorType === 'other' ? styles.selectedRoleText : {}}>
                    Other
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Your Name/Company *</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.actor}
                onChangeText={(text) => updateField('actor', text)}
                placeholder="Enter your name or company"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Current Location *</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => updateField('location', text)}
                placeholder="Enter current location"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Action Details *</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.details}
                onChangeText={(text) => updateField('details', text)}
                placeholder="Describe what you did with the product (e.g., imported, packaged, transported)"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </ThemedView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleUpdateProduct}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.buttonText}>Update Product Journey</ThemedText>
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
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    marginBottom: 10,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  productId: {
    marginTop: 5,
    opacity: 0.8,
  },
  summaryCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  productDetail: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 100,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 15,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },
  rolePill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  selectedRole: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  selectedRoleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});