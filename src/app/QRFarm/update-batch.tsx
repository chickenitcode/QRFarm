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

// Import the API functions
import { addBatchBlock, getBatch, getBatchProducts } from '@/services/api';

interface BatchData {
  id: string;
  productType: string;
  harvestDate: Date | string;
  location: string;
  responsibleStaff: string;
  quantity: number;
  status?: string;
  notes?: string;
  lastUpdated?: number;
  blocks?: BatchBlock[]; // Add this to store the blockchain
}

interface BatchBlock {
  blockId: number;
  timestamp: number;
  actor: string;
  location: string;
  data: any;
  prevHash: string;
  hash: string;
}


export default function UpdateBatchScreen() {
  const params = useLocalSearchParams();
  const batchId = params.batchId as string;
  
  const [batch, setBatch] = useState<BatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for the products in this batch
  const [products, setProducts] = useState<string[]>([]);
  
  // Form state for the batch update
  const [formData, setFormData] = useState({
    stageName: '',
    actor: '',
    location: '',
    notes: '',
    status: '',
  });

  // Load batch data when component mounts
  useFocusEffect(
    useCallback(() => {
      console.log('Update batch screen focused with ID:', batchId);
      
      // Reset form state
      setFormData({
        stageName: '',
        actor: '',
        location: '',
        notes: '',
        status: '',
      });
      
      // Reset data states
      setBatch(null);
      setProducts([]);
      setError(null);
      
      // Fetch fresh data
      fetchBatchData();
      
      return () => {
        // Any cleanup if needed
      };
    }, [batchId])
  );

  // Replace the fetchBatchData function
  const fetchBatchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get batch data from the API
      const batchData = await getBatch(batchId);
      setBatch(batchData);
      
      // Get products associated with this batch
      const productsData = await getBatchProducts(batchId);
      const productIds = productsData.map((product: { id?: string; _id?: string }) => product.id || product._id);
      setProducts(productIds);
    } catch (e) {
      console.error('Error fetching batch:', e);
      setError('Failed to load batch data. Please check your connection.');
      
      // Fallback to mock data for demo purposes if API fails
      if (Platform.OS !== 'web') {
        const mockBatch = createMockBatch(batchId);
        setBatch(mockBatch);
        setProducts([`PROD-${batchId}-001`, `PROD-${batchId}-002`]);
      }
    } finally {
      setLoading(false);
    }
  };

  const createMockBatch = (id: string): BatchData => {
    // Create mock batch data for testing
    return {
      id,
      productType: 'Premium Apples',
      harvestDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days ago
      location: 'Orchard Farm',
      responsibleStaff: 'John Smith',
      quantity: 2,
      status: 'In Transport',
      notes: 'Mock batch for testing',
      lastUpdated: Date.now() - 2 * 24 * 60 * 60 * 1000 // 2 days ago
    };
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add this function after the updateField function
  const calculateHash = (blockId: number, prevHash: string | number, data: string) => {
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

  // Replace the handleUpdateBatch function
  const handleUpdateBatch = () => {
    // Validate the form fields
    if (!formData.stageName || !formData.actor || !formData.location) {
      Alert.alert('Missing Information', 'Please fill in at least the stage name, your name, and location.');
      return;
    }

    if (!batch) {
      Alert.alert('Error', 'Batch data not available.');
      return;
    }

    try {
      // Get existing batch blocks or initialize if not present
      let batchBlocks = batch.blocks || [];
      
      // Create the block data
      const blockData = {
        stageName: formData.stageName,
        status: formData.status || batch.status,
        notes: formData.notes || '',
        action: 'batch_updated'
      };
      
      // Generate new block in the chain
      let newBlock;
      
      if (batchBlocks.length === 0) {
        // Create genesis block if no blocks exist
        const genesisData = {
          productType: batch.productType,
          harvestDate: batch.harvestDate,
          location: batch.location,
          responsibleStaff: batch.responsibleStaff,
          action: 'batch_created'
        };
        
        // Calculate hash for genesis block
        const genesisHash = calculateHash(0, '0', JSON.stringify(genesisData));
        
        const genesisBlock = {
          blockId: 0,
          timestamp: Date.now() - 86400000, // Set to 1 day ago to show history
          actor: batch.responsibleStaff || 'Producer',
          location: batch.location,
          data: genesisData,
          prevHash: '0', // Genesis block has prevHash of 0
          hash: genesisHash
        };
        
        batchBlocks.push(genesisBlock);
      }
      
      // Get the last block and create a new one
      const lastBlock = batchBlocks[batchBlocks.length - 1];
      const newBlockId = lastBlock.blockId + 1;
      
      // Calculate hash for the new block
      const newHash = calculateHash(newBlockId, lastBlock.hash, JSON.stringify(blockData));
      
      newBlock = {
        blockId: newBlockId,
        timestamp: Date.now(),
        actor: formData.actor,
        location: formData.location,
        data: blockData,
        prevHash: lastBlock.hash,
        hash: newHash
      };
      
      // Save the new block to the database via API
      addBatchBlock(batchId, newBlock)
        .then(() => {
          console.log('Batch updated via API');
          console.log('New block added:', newBlock);
          
          // Provide haptic feedback on success
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          
          // Show success message and navigate back
          Alert.alert(
            'Batch Updated',
            'The batch journey has been successfully updated with secure blockchain record.',
            [{ 
              text: 'OK', 
              onPress: () => router.navigate('/QRFarm')
            }]
          );
        })
        .catch(error => {
          console.error('API error updating batch:', error);
          Alert.alert('Error', 'Failed to update batch information. Please try again.');
        });
    } catch (e) {
      console.error('Error updating batch:', e);
      Alert.alert('Error', 'Failed to update batch information. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <Ionicons name="hourglass-outline" size={40} color="#557089" />
          <ThemedText style={styles.loadingText}>Loading batch data...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error || !batch) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#557089" />
          <ThemedText style={styles.errorTitle}>Error</ThemedText>
          <ThemedText style={styles.errorText}>{error || 'Batch not found'}</ThemedText>
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

  // Format date for display
  const formattedDate = typeof batch.harvestDate === 'string' 
    ? batch.harvestDate 
    : new Date(batch.harvestDate).toISOString().split('T')[0];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          
          <ThemedView style={styles.batchHeader}>
            <ThemedText style={styles.batchId}>
              Batch ID: {batchId}
            </ThemedText>
          </ThemedView>
          
          {/* Batch summary */}
          <ThemedView style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle-outline" size={22} color="#557089" />
              <ThemedText style={styles.cardTitle}>Batch Summary</ThemedText>
            </View>
            
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Product Type:</ThemedText>
              <ThemedText style={styles.qualityText}>{batch.productType}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Harvest Date:</ThemedText>
              <ThemedText style={styles.qualityText}>{formattedDate}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Origin:</ThemedText>
              <ThemedText style={styles.qualityText}>{batch.location}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Products:</ThemedText>
              <ThemedText style={styles.qualityText}>{batch.quantity}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Current Status:</ThemedText>
              <View style={styles.statusBadge}>
                <ThemedText style={styles.statusText}>{batch.status || 'In Processing'}</ThemedText>
              </View>
            </View>
          </ThemedView>
          
          {/* Products in batch */}
          {products.length > 0 && (
            <ThemedView style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="cube-outline" size={22} color="#557089" />
                <ThemedText style={styles.cardTitle}>Products in Batch</ThemedText>
              </View>
              
              {products.map((productId, index) => (
                <View key={productId} style={styles.productItem}>
                  <View style={styles.productIdContainer}>
                    <Ionicons name="barcode-outline" size={18} color="#557089" />
                    <ThemedText style={styles.productId}>{productId}</ThemedText>
                  </View>
                  <TouchableOpacity 
                    style={styles.updateButton}
                    onPress={() => router.navigate({
                      pathname: '/QRFarm/update-product',
                      params: { productId }
                    })}
                  >
                    <Ionicons name="create-outline" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ThemedView>
          )}
          
          {/* Update form */}
          <ThemedView style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="trail-sign-outline" size={22} color="#557089" />
              <ThemedText style={styles.cardTitle}>Add Journey Stage</ThemedText>
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Stage Name *</ThemedText>
              <View style={styles.pickerContainer}>
                {['Processing', 'Packaging', 'Transport', 'Distribution', 'Retail'].map((stage) => (
                  <TouchableOpacity 
                    key={stage}
                    style={[
                      styles.stagePill, 
                      formData.stageName === stage && styles.selectedStage
                    ]}
                    onPress={() => updateField('stageName', stage)}
                  >
                    <ThemedText style={formData.stageName === stage ? styles.selectedPillText : styles.pillText}>
                      {stage}
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
              <ThemedText style={styles.label}>Update Status</ThemedText>
              <View style={styles.pickerContainer}>
                {[
                  'In Processing', 
                  'In Transport', 
                  'At Distributor', 
                  'At Retail', 
                  'Delivered'
                ].map((status) => (
                  <TouchableOpacity 
                    key={status}
                    style={[
                      styles.statusPill, 
                      formData.status === status && styles.selectedStatus
                    ]}
                    onPress={() => updateField('status', status)}
                  >
                    <ThemedText style={formData.status === status ? styles.selectedPillText : styles.pillText}>
                      {status}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Notes</ThemedText>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={styles.textArea}
                  value={formData.notes}
                  onChangeText={(text) => updateField('notes', text)}
                  placeholder="Add any additional information or notes"
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
              onPress={handleUpdateBatch}
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
  batchHeader: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  batchId: {
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 110,
    color: '#557089',
  },
  statusBadge: {
    backgroundColor: 'rgba(176, 199, 86, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    fontWeight: '500',
    color: '#557089',
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(176, 199, 86, 0.2)',
  },
  productIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productId: {
    fontWeight: '500',
    color: '#557089',
  },
  qualityText: {
    fontWeight: '600',
    color: '#557089',
  },
  updateButton: {
    backgroundColor: '#557089',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  updateButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
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
  stagePill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(176, 199, 86, 0.3)',
    backgroundColor: 'white',
    marginBottom: 8,
  },
  selectedStage: {
    backgroundColor: '#557089',
    borderColor: '#557089',
  },
  statusPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(176, 199, 86, 0.3)',
    backgroundColor: 'white',
    marginBottom: 8,
  },
  selectedStatus: {
    backgroundColor: '#B0C756',
    borderColor: '#B0C756',
  },
  pillText: {
    color: '#557089',
  },
  selectedPillText: {
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