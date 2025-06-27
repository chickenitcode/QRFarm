import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Import the API services
import { addBatchBlock, getBatch, saveChildProduct } from '@/services/api';

// Import the URL generators
import { generateBatchUrl, generateProductUrl } from '@/config/urls';

interface ChildProductData {
  id: string;
  parentId: string;
  weight: number;
  size: string;
  quality: string; 
  additionalNotes: string;
  // Blockchain related fields
  blocks: ProductBlock[];
}

// New interface for product blocks
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

export default function AddChildProductScreen() {
  const params = useLocalSearchParams();
  const batchId = params.batchId as string;
  const batchDataString = params.batchData as string;
  
  const [batchData, setBatchData] = useState<any>(null);
  const [productCount, setProductCount] = useState(0);
  
  const [childProduct, setChildProduct] = useState<Omit<ChildProductData, 'id' | 'parentId'>>({
    weight: 0,
    size: '',
    quality: '',
    additionalNotes: '',
    blocks: [],
  });
  
  const [qrValue, setQrValue] = useState('');
  const [productId, setProductId] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [showBatchQR, setShowBatchQR] = useState(false);
  const [batchQRValue, setBatchQRValue] = useState('');
  const [showProductQR, setShowProductQR] = useState(false);
  
  // Add this useFocusEffect hook to reset state when screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('AddChildProductScreen focused with batchId:', batchId);
      
      // Parse batch data from params
      if (batchDataString) {
        try {
          const parsed = JSON.parse(batchDataString);
          setBatchData(parsed);
        } catch (error) {
          console.error('Failed to parse batch data:', error);
        }
      }
      
      // Reset product form state
      setChildProduct({
        weight: 0,
        size: '',
        quality: '',
        additionalNotes: '',
        blocks: [],
      });
      
      // Reset all QR and display state
      setQrValue('');
      setProductId('');
      setShowQR(false);
      setShowProductQR(false);
      setShowBatchQR(false);
      
      // Reset product count when a new batch is started
      setProductCount(0);
      
      return () => {
        // Clean up if needed
      };
    }, [batchId, batchDataString])
  );
  
  const updateField = (field: keyof Omit<ChildProductData, 'id' | 'parentId'>, value: string | number) => {
    setChildProduct(prev => ({ ...prev, [field]: value }));
  };
  
  const generateChildQR = () => {
    // Validate required fields
    if (childProduct.weight && childProduct.size.trim()) {
      
      // Generate a unique ID for the child product
      const uniqueId = `PROD-${batchId}-${(productCount + 1).toString().padStart(3, '0')}`;
      setProductId(uniqueId);
      
      // Create initial block data
      const initialBlockData = {
        productDetails: {
          weight: childProduct.weight,
          size: childProduct.size,
          quality: childProduct.quality || 'Standard',
        },
        batch: batchId,
        notes: childProduct.additionalNotes || '',
      };
      
      // Calculate hash for the initial block
      const initialBlockHash = calculateHash(0, 0, JSON.stringify(initialBlockData));
      
      const initialBlock = {
        blockId: 0,
        timestamp: Date.now(),
        actor: 'Producer', 
        actorType: 'producer',
        location: batchData?.location || 'Unknown',
        data: initialBlockData,
        prevHash: '0',
        hash: initialBlockHash
      };
      
      // Create the full child product data with blockchain structure
      const fullChildData = {
        ...childProduct,
        id: uniqueId,
        batchId: batchId,
        blocks: [initialBlock]
      };
      
      // Save product data using the API
      saveChildProduct(fullChildData)
        .then(() => {
          // Create QR URL using the new pattern for products
          const qrUrl = generateProductUrl(uniqueId);
          
          setQrValue(qrUrl);
          setShowProductQR(true);
          setShowBatchQR(false);
          
          // Increase the product count
          setProductCount(prev => prev + 1);
          
          // Provide haptic feedback on success
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        })
        .catch(error => {
          console.error('Error saving product:', error);
          Alert.alert('Error', 'Failed to save product. Please try again.');
        });
    } else {
      Alert.alert('Missing Information', 'Please enter at least weight and size for the product.');
      
      // Provide haptic feedback on error
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  // Add a simple hash function (in a real app, use a proper cryptographic hash)
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

  const addAnotherProduct = () => {
    setChildProduct({
      weight: 0,
      size: '',
      quality: '',
      additionalNotes: '',
      blocks: [],
    });
    
    // Hide all QR displays
    setShowQR(false);
    setShowProductQR(false);  // Add this line to hide product QR
    setShowBatchQR(false);    // Also hide batch QR just in case
  };

  const completeBatch = () => {
    if (productCount === 0) {
      Alert.alert(
        'No Products Added',
        'Please add at least one product before completing the batch.',
        [{ text: 'OK' }]
      );
      return;
    }

    // First, get the current batch to find the previous block's hash
    getBatch(batchId)
      .then(batch => {
        // Get the last block in the chain
        const lastBlock = batch.blocks[batch.blocks.length - 1];
        const prevHash = lastBlock.hash;
        
        // Create a final block for the batch completion with correct prevHash
        const finalBlock = {
          blockId: batch.blocks.length, // Correct incremental blockId
          timestamp: Date.now(),
          actor: "System",
          location: batchData?.location || "Unknown",
          data: {
            action: "batch_completed",
            quantity: productCount,
            status: "Completed"
          },
          prevHash: prevHash, // Use the hash from the previous block!
          hash: calculateHash(batch.blocks.length, prevHash, JSON.stringify({ 
            quantity: productCount, 
            status: "Completed" 
          }))
        };
        
        // Add the final block to the batch chain using the API
        return addBatchBlock(batchId, finalBlock);
      })
      .then(() => {
        // Set the final batch QR URL
        const batchQrUrl = generateBatchUrl(batchId);
        
        // No alert - directly show the batch QR and add a "Home" button
        setShowQR(false);
        setShowProductQR(false);
        setBatchQRValue(batchQrUrl);
        setShowBatchQR(true);
        
        // Provide haptic feedback on success
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      })
      .catch(error => {
        console.error('Failed to update batch:', error);
        Alert.alert('Error', 'Failed to update batch. Please try again.');
      });
  };

  // Function to update the batch in database
  const updateBatchInDatabase = async (batch: any) => {
    // In a real app, this would update the batch in your database
    console.log('Updating batch with new quantity:', batch);
    
    // For demo purposes, we'll simulate an API call with a promise
    return new Promise<void>((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        // Log the updated batch
        console.log('Batch updated successfully:', batch);
        
        // Provide haptic feedback on success
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        resolve();
      }, 500); // Simulate half-second delay
    });
  };

  // Add this function at the same level as other functions in your component
  const printQRCode = (id: string, type: 'product' | 'batch') => {
    console.log(`Printing ${type} QR code for ID: ${id}`);
    // In a real implementation, you would connect to a printer API
    // or generate a PDF for printing
    
    // Provide haptic feedback on print
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    Alert.alert(
      'Print Requested',
      `Printing ${type} QR code for ${id}`,
      [{ text: 'OK' }]
    );
  };

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
            <View style={styles.batchInfoContainer}>
              <Ionicons name="cube-outline" size={22} color="#557089" style={styles.batchIcon} />
              <View>
                <ThemedText style={styles.batchId}>Batch ID: {batchId}</ThemedText>
                {batchData && (
                  <ThemedText style={styles.batchInfo}>
                    {batchData.productType} • {productCount} products added
                  </ThemedText>
                )}
              </View>
            </View>
          </ThemedView>
          
          {!showBatchQR && !showProductQR && (
            <ThemedView style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="add-circle-outline" size={22} color="#557089" />
                <ThemedText style={styles.cardTitle}>Product Details</ThemedText>
              </View>
              
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Weight (kg) *</ThemedText>
                <View style={styles.inputWrapper}>
                  <Ionicons name="scale-outline" size={20} color="#557089" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={String(childProduct.weight)}
                    onChangeText={(text) => updateField('weight', text ? parseFloat(text) : 0)}
                    placeholder="Enter product weight"
                    placeholderTextColor="#8A8A8A"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Size (cm) *</ThemedText>
                <View style={styles.inputWrapper}>
                  <Ionicons name="resize-outline" size={20} color="#557089" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={childProduct.size}
                    onChangeText={(text) => updateField('size', text)}
                    placeholder="Enter product size"
                    placeholderTextColor="#8A8A8A"
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Quality Grade</ThemedText>
                <View style={styles.pickerContainer}>
                  {['A', 'B', 'C', 'Premium', 'Standard'].map((grade) => (
                    <TouchableOpacity 
                      key={grade}
                      style={[
                        styles.gradePill, 
                        childProduct.quality === grade && styles.selectedGrade
                      ]}
                      onPress={() => updateField('quality', grade)}
                    >
                      <ThemedText 
                        style={childProduct.quality === grade ? styles.selectedGradeText : styles.gradeText}
                      >
                        {grade}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Additional Notes</ThemedText>
                <View style={styles.textAreaWrapper}>
                  <TextInput
                    style={styles.textArea}
                    value={childProduct.additionalNotes}
                    onChangeText={(text) => updateField('additionalNotes', text)}
                    placeholder="Enter any additional information about this product"
                    placeholderTextColor="#8A8A8A"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={generateChildQR}
                activeOpacity={0.7}
              >
                <Ionicons name="qr-code-outline" size={20} color="white" style={styles.buttonIcon} />
                <ThemedText style={styles.buttonText}>Generate Product QR</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
          
          {showProductQR && (
            <ThemedView style={styles.qrCard}>
              <View style={styles.qrHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#557089" />
                <ThemedText style={styles.qrTitle}>Product QR Generated</ThemedText>
              </View>
              
              <View style={styles.qrCodeContainer}>
                <QRCode
                  value={qrValue}
                  size={200}
                  backgroundColor="white"
                  color="#557089"
                />
              </View>
              
              <ThemedText style={styles.productIdText}>
                ID: {productId}
              </ThemedText>
              
              <View style={styles.productDetailsChips}>
                <View style={styles.detailChip}>
                  <Ionicons name="scale-outline" size={16} color="#557089" />
                  <ThemedText style={styles.chipText}>{childProduct.weight} kg</ThemedText>
                </View>
                <View style={styles.detailChip}>
                  <Ionicons name="resize-outline" size={16} color="#557089" />
                  <ThemedText style={styles.chipText}>{childProduct.size} cm</ThemedText>
                </View>
                {childProduct.quality && (
                  <View style={styles.detailChip}>
                    <Ionicons name="ribbon-outline" size={16} color="#557089" />
                    <ThemedText style={styles.chipText}>{childProduct.quality}</ThemedText>
                  </View>
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.printButton} 
                onPress={() => printQRCode(productId, 'product')}
              >
                <Ionicons name="print-outline" size={20} color="white" style={styles.buttonIcon} />
                <ThemedText style={styles.buttonText}>Print QR Code</ThemedText>
              </TouchableOpacity>
              
              <View style={styles.actionContainer}>
                <TouchableOpacity 
                  style={styles.secondaryButton} 
                  onPress={addAnotherProduct}
                >
                  <Ionicons name="add-outline" size={20} color="#557089" style={styles.buttonIcon} />
                  <ThemedText style={styles.secondaryButtonText}>Add Another</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.completeButton} 
                  onPress={completeBatch}
                >
                  <Ionicons name="checkmark-done-outline" size={20} color="white" style={styles.buttonIcon} />
                  <ThemedText style={styles.buttonText}>Complete Batch</ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          )}
          
          {showBatchQR && (
            <ThemedView style={styles.qrCard}>
              <View style={styles.qrSuccessHeader}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={40} color="#B0C756" />
                </View>
                <ThemedText style={styles.successTitle}>Batch Completed!</ThemedText>
                <ThemedText style={styles.successSubtitle}>
                  All {productCount} products have been added successfully
                </ThemedText>
              </View>
              
              <View style={styles.qrCodeContainer}>
                <QRCode
                  value={batchQRValue}
                  size={200}
                  backgroundColor="white"
                  color="#557089"
                />
              </View>
              
              <ThemedText style={styles.productIdText}>
                Batch ID: {batchId}
              </ThemedText>
              
              <TouchableOpacity 
                style={styles.printButton} 
                onPress={() => printQRCode(batchId, 'batch')}
              >
                <Ionicons name="print-outline" size={20} color="white" style={styles.buttonIcon} />
                <ThemedText style={styles.buttonText}>Print Batch QR</ThemedText>
              </TouchableOpacity>
              
              <View style={styles.finalActionContainer}>
                <TouchableOpacity 
                  style={styles.newBatchButton} 
                  onPress={() => router.push('/QRFarm/create-qr')}
                >
                  <Ionicons name="add-circle-outline" size={20} color="white" style={styles.buttonIcon} />
                  <ThemedText style={styles.buttonText}>Create New Batch</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.homeButton} 
                  onPress={() => router.navigate('/QRFarm/create-qr')}
                >
                  <Ionicons name="home-outline" size={20} color="white" style={styles.buttonIcon} />
                  <ThemedText style={styles.buttonText}>Go Home</ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          )}
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
    paddingBottom: 40,
  },
  batchHeader: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  batchInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batchIcon: {
    marginRight: 10,
  },
  batchId: {
    fontWeight: '600',
    color: '#557089',
    fontSize: 16,
  },
  batchInfo: {
    color: '#557089',
    opacity: 0.8,
    marginTop: 2,
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
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },
  gradePill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(176, 199, 86, 0.3)',
    backgroundColor: 'white',
    marginBottom: 8,
  },
  selectedGrade: {
    backgroundColor: '#557089',
    borderColor: '#557089',
  },
  gradeText: {
    color: '#557089',
  },
  selectedGradeText: {
    color: 'white',
    fontWeight: 'bold',
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
  primaryButton: {
    backgroundColor: '#557089',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  qrCard: {
    padding: 20,
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
    alignItems: 'center',
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#557089',
  },
  qrCodeContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20,
  },
  productIdText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#557089',
    marginBottom: 16,
  },
  productDetailsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(176, 199, 86, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  chipText: {
    color: '#557089',
    fontWeight: '500',
    fontSize: 14,
  },
  printButton: {
    backgroundColor: '#557089',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 14,
  },
  actionContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#557089',
  },
  secondaryButtonText: {
    color: '#557089',
    fontWeight: '600',
    fontSize: 16,
  },
  completeButton: {
    flex: 2,
    backgroundColor: '#B0C756',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  qrSuccessHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(176, 199, 86, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#557089',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#557089',
    textAlign: 'center',
    opacity: 0.8,
  },
  finalActionContainer: {
    width: '100%',
    gap: 12,
    marginTop: 10,
  },
  newBatchButton: {
    backgroundColor: '#557089',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 10,
  },
  homeButton: {
    backgroundColor: '#B0C756',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  }
});
