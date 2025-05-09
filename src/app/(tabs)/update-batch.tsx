import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

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

interface BatchStage {
  stageId: number;
  timestamp: number;
  stageName: string;
  actor: string;
  location: string;
  notes: string;
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
  useEffect(() => {
    fetchBatchData();
  }, [batchId]);

  const fetchBatchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call to your backend
      // For demo, we'll try to get it from localStorage
      if (typeof localStorage !== 'undefined') {
        // Get batch data
        const storedData = localStorage.getItem(`batch_${batchId}`);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setBatch(parsedData);
        } else {
          // If no direct batch data, try to fallback to mock data
          const mockBatch = createMockBatch(batchId);
          setBatch(mockBatch);
        }
        
        // Get products associated with this batch
        const batchProductsKey = `batch_products_${batchId}`;
        const storedProducts = localStorage.getItem(batchProductsKey);
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts));
        }
      } else {
        // For mobile testing where localStorage isn't available
        const mockBatch = createMockBatch(batchId);
        setBatch(mockBatch);
        setProducts([`PROD-${batchId}-001`, `PROD-${batchId}-002`]);
      }
    } catch (e) {
      console.error('Error fetching batch:', e);
      setError('Failed to load batch data');
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
      .reduce((hash, char) => hash ^ char.charCodeAt(0) + ((hash << 5) - hash), 0)
      .toString(16);
  };

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
      
      // Add the new block to the chain
      batchBlocks.push(newBlock);
      
      // Update batch data
      const updatedBatch = {
        ...batch,
        status: formData.status || batch.status,
        notes: formData.notes || batch.notes,
        lastUpdated: Date.now(),
        blocks: batchBlocks
      };
      
      // Create a new stage entry for compatibility with existing code
      const newStage: BatchStage = {
        stageId: Date.now(),
        timestamp: Date.now(),
        stageName: formData.stageName,
        actor: formData.actor,
        location: formData.location,
        notes: formData.notes || ''
      };
      
      // Save the updated batch stages (keeping for compatibility)
      const batchStagesKey = `batch_stages_${batchId}`;
      let stages: BatchStage[] = [];
      
      if (typeof localStorage !== 'undefined') {
        try {
          const storedStages = localStorage.getItem(batchStagesKey);
          if (storedStages) {
            stages = JSON.parse(storedStages);
          }
        } catch (e) {
          console.error('Error reading stages:', e);
        }
        
        // Add the new stage
        stages.push(newStage);
        
        // Save batch data, stages, and blocks
        localStorage.setItem(`batch_${batchId}`, JSON.stringify(updatedBatch));
        localStorage.setItem(batchStagesKey, JSON.stringify(stages));
        localStorage.setItem(`batch_blocks_${batchId}`, JSON.stringify(batchBlocks));
      }
      
      console.log('Batch updated:', updatedBatch);
      console.log('New block added:', newBlock);
      console.log('Current hash chain length:', batchBlocks.length);
      
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
          onPress: () => router.navigate('/(tabs)')
        }]
      );
    } catch (e) {
      console.error('Error updating batch:', e);
      Alert.alert('Error', 'Failed to update batch information. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.centered}>
          <ThemedText>Loading batch data...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error || !batch) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.centered}>
          <ThemedText type="title" style={styles.errorTitle}>Error</ThemedText>
          <ThemedText style={styles.errorText}>{error || 'Batch not found'}</ThemedText>
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

  // Format date for display
  const formattedDate = typeof batch.harvestDate === 'string' 
    ? batch.harvestDate 
    : new Date(batch.harvestDate).toISOString().split('T')[0];

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
            <ThemedText type="title">Update Batch</ThemedText>
            <ThemedText style={styles.batchId}>
              Batch ID: {batchId}
            </ThemedText>
          </ThemedView>
          
          {/* Batch summary */}
          <ThemedView style={styles.summaryCard}>
            <ThemedText style={styles.cardTitle}>Batch Summary</ThemedText>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Product Type:</ThemedText>
              <ThemedText>{batch.productType}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Harvest Date:</ThemedText>
              <ThemedText>{formattedDate}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Origin:</ThemedText>
              <ThemedText>{batch.location}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Products:</ThemedText>
              <ThemedText>{batch.quantity}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Current Status:</ThemedText>
              <ThemedText>{batch.status || 'In Processing'}</ThemedText>
            </View>
          </ThemedView>
          
          {/* Products in batch */}
          {products.length > 0 && (
            <ThemedView style={styles.productsCard}>
              <ThemedText style={styles.cardTitle}>Products in Batch</ThemedText>
              {products.map((productId, index) => (
                <View key={productId} style={styles.productItem}>
                  <ThemedText style={styles.productId}>{productId}</ThemedText>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => router.navigate({
                      pathname: '/(tabs)/update-product',
                      params: { productId }
                    })}
                  >
                    <ThemedText style={styles.viewButtonText}>Update</ThemedText>
                  </TouchableOpacity>
                </View>
              ))}
            </ThemedView>
          )}
          
          {/* Update form */}
          <ThemedView style={styles.formCard}>
            <ThemedText style={styles.cardTitle}>Add Journey Stage</ThemedText>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Stage Name *</ThemedText>
              <View style={styles.pickerContainer}>
                <TouchableOpacity 
                  style={[
                    styles.stagePill, 
                    formData.stageName === 'Processing' && styles.selectedStage
                  ]}
                  onPress={() => updateField('stageName', 'Processing')}
                >
                  <ThemedText style={formData.stageName === 'Processing' ? styles.selectedStageText : {}}>
                    Processing
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.stagePill, 
                    formData.stageName === 'Packaging' && styles.selectedStage
                  ]}
                  onPress={() => updateField('stageName', 'Packaging')}
                >
                  <ThemedText style={formData.stageName === 'Packaging' ? styles.selectedStageText : {}}>
                    Packaging
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.stagePill, 
                    formData.stageName === 'Transport' && styles.selectedStage
                  ]}
                  onPress={() => updateField('stageName', 'Transport')}
                >
                  <ThemedText style={formData.stageName === 'Transport' ? styles.selectedStageText : {}}>
                    Transport
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.stagePill, 
                    formData.stageName === 'Distribution' && styles.selectedStage
                  ]}
                  onPress={() => updateField('stageName', 'Distribution')}
                >
                  <ThemedText style={formData.stageName === 'Distribution' ? styles.selectedStageText : {}}>
                    Distribution
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.stagePill, 
                    formData.stageName === 'Retail' && styles.selectedStage
                  ]}
                  onPress={() => updateField('stageName', 'Retail')}
                >
                  <ThemedText style={formData.stageName === 'Retail' ? styles.selectedStageText : {}}>
                    Retail
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
              <ThemedText style={styles.label}>Update Status</ThemedText>
              <View style={styles.pickerContainer}>
                <TouchableOpacity 
                  style={[
                    styles.statusPill, 
                    formData.status === 'In Processing' && styles.selectedStatus
                  ]}
                  onPress={() => updateField('status', 'In Processing')}
                >
                  <ThemedText style={formData.status === 'In Processing' ? styles.selectedStatusText : {}}>
                    In Processing
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.statusPill, 
                    formData.status === 'In Transport' && styles.selectedStatus
                  ]}
                  onPress={() => updateField('status', 'In Transport')}
                >
                  <ThemedText style={formData.status === 'In Transport' ? styles.selectedStatusText : {}}>
                    In Transport
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.statusPill, 
                    formData.status === 'At Distributor' && styles.selectedStatus
                  ]}
                  onPress={() => updateField('status', 'At Distributor')}
                >
                  <ThemedText style={formData.status === 'At Distributor' ? styles.selectedStatusText : {}}>
                    At Distributor
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.statusPill, 
                    formData.status === 'At Retail' && styles.selectedStatus
                  ]}
                  onPress={() => updateField('status', 'At Retail')}
                >
                  <ThemedText style={formData.status === 'At Retail' ? styles.selectedStatusText : {}}>
                    At Retail
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.statusPill, 
                    formData.status === 'Delivered' && styles.selectedStatus
                  ]}
                  onPress={() => updateField('status', 'Delivered')}
                >
                  <ThemedText style={formData.status === 'Delivered' ? styles.selectedStatusText : {}}>
                    Delivered
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Notes</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => updateField('notes', text)}
                placeholder="Add any additional information or notes"
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
              onPress={handleUpdateBatch}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.buttonText}>Update Batch Journey</ThemedText>
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
  batchId: {
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
  productsCard: {
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
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 100,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productId: {
    fontWeight: '500',
  },
  viewButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  viewButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
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
    marginBottom: 10,
  },
  stagePill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  selectedStage: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  selectedStageText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statusPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  selectedStatus: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  selectedStatusText: {
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