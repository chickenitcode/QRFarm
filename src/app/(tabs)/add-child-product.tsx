import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      .reduce((hash, char) => hash ^ char.charCodeAt(0) + ((hash << 5) - hash), 0)
      .toString(16);
  };

  // Function to save product data to your backend
  const saveChildProductToDatabase = (product: ChildProductData) => {
    // In a real app, this would call your API to save to a database
    console.log('Saving product to database:', product);
    
    // Example API call:
    // fetch('https://yourapi.com/products', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(product),
    // })
    // .then(response => response.json())
    // .then(data => console.log('Product saved:', data))
    // .catch(error => console.error('Error saving product:', error));
  };
  
  // Add this function to keep track of products in a batch
  const addProductToBatch = (batchId: string, productId: string) => {
    try {
      // In a real app, you would call an API to update the batch
      console.log(`Adding product ${productId} to batch ${batchId}`);
      
      // For demo purposes, use localStorage to track batch contents
      if (typeof localStorage !== 'undefined') {
        // Get current products in batch
        const batchProductsKey = `batch_products_${batchId}`;
        const currentProducts = JSON.parse(localStorage.getItem(batchProductsKey) || '[]');
        
        // Add the new product
        currentProducts.push(productId);
        
        // Save back to localStorage
        localStorage.setItem(batchProductsKey, JSON.stringify(currentProducts));
      }
    } catch (e) {
      console.error('Error adding product to batch:', e);
    }
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
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          
          <ThemedView style={styles.header}>
            <ThemedText type="title">Add Product to Batch</ThemedText>
            <ThemedText style={styles.description}>
              Batch ID: {batchId}
            </ThemedText>
            {batchData && (
              <ThemedText style={styles.batchInfo}>
                {batchData.productType} - {productCount} products added
              </ThemedText>
            )}
          </ThemedView>
          
          <ThemedView style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Weight (kg) *</ThemedText>
              <TextInput
                style={styles.input}
                value={String(childProduct.weight)}
                onChangeText={(text) => updateField('weight', text ? parseFloat(text) : 0)}
                placeholder="Enter product weight"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Size (cm) *</ThemedText>
              <TextInput
                style={styles.input}
                value={childProduct.size}
                onChangeText={(text) => updateField('size', text)}
                placeholder="Enter product size"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Quality Grade</ThemedText>
              <TextInput
                style={styles.input}
                value={childProduct.quality}
                onChangeText={(text) => updateField('quality', text)}
                placeholder="Enter quality grade (e.g., A, B, Premium)"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Additional Notes</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={childProduct.additionalNotes}
                onChangeText={(text) => updateField('additionalNotes', text)}
                placeholder="Enter any additional information"
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
              onPress={generateChildQR}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.buttonText}>Generate Product QR</ThemedText>
            </TouchableOpacity>
          </View>
          
          {showQR && (
            <ThemedView style={styles.qrContainer}>
              <QRCode
                value={qrValue}
                size={200}
                backgroundColor="white"
                color="black"
              />
              <ThemedText style={styles.resultText}>
                Product QR Generated - ID: {productId}
              </ThemedText>
              <ThemedText style={styles.infoText}>
                Weight: {childProduct.weight}kg, Size: {childProduct.size}cm
              </ThemedText>
              <ThemedText style={styles.infoText}>
                Part of Batch: {batchId}
              </ThemedText>
              
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={addAnotherProduct}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.actionButtonText}>
                    Add Another Product
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.completeButton]} 
                  onPress={completeBatch}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.completeButtonText}>
                    Complete Batch
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          )}

          {showProductQR && (
            <ThemedView style={styles.qrContainer}>
              <QRCode
                value={qrValue}
                size={200}
                backgroundColor="white"
                color="black"
              />
              <ThemedText style={styles.resultText}>
                Product QR Generated - ID: {productId}
              </ThemedText>
              <ThemedText style={styles.infoText}>
                Scan to view full product details
              </ThemedText>
              <ThemedText style={styles.urlText}>
                {qrValue}
              </ThemedText>
              
              {/* Add Print Button */}
              <TouchableOpacity 
                style={styles.printButton} 
                onPress={() => printQRCode(productId, 'product')}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.printButtonText}>
                  Print QR Code
                </ThemedText>
              </TouchableOpacity>
              
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={addAnotherProduct}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.actionButtonText}>
                    Add Another Product
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.completeButton]} 
                  onPress={completeBatch}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.completeButtonText}>
                    Complete Batch
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          )}

          {showBatchQR && (
            <ThemedView style={styles.qrContainer}>
              <QRCode
                value={batchQRValue}
                size={200}
                backgroundColor="white"
                color="black"
              />
              <ThemedText style={styles.resultText}>
                Batch QR Generated - ID: {batchId}
              </ThemedText>
              <ThemedText style={styles.infoText}>
                Quantity: {productCount}
              </ThemedText>
              
              {/* Print Button */}
              <TouchableOpacity 
                style={styles.printButton} 
                onPress={() => printQRCode(batchId, 'batch')}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.printButtonText}>
                  Print QR Code
                </ThemedText>
              </TouchableOpacity>
              
              {/* Add New Batch Button */}
              <TouchableOpacity 
                style={styles.addBatchButton} 
                onPress={() => router.push('/(tabs)/create-qr')}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.addBatchButtonText}>
                  Add New Batch
                </ThemedText>
              </TouchableOpacity>
              
              {/* Home Button */}
              <TouchableOpacity 
                style={styles.homeButton} 
                onPress={() => router.navigate('/(tabs)')}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.homeButtonText}>
                  Home
                </ThemedText>
              </TouchableOpacity>
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
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  description: {
    marginTop: 8,
    opacity: 0.8,
  },
  batchInfo: {
    marginTop: 4,
    opacity: 0.8,
    fontWeight: '500',
  },
  formContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
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
  buttonContainer: {
    marginBottom: 24,
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
  qrContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoText: {
    marginTop: 6,
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
  actionButtonsContainer: {
    flexDirection: 'column',
    width: '100%',
    gap: 10,
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  completeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  batchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#0a7ea4',
    textAlign: 'center',
  },
  urlText: {
    marginTop: 6,
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  printButton: {
    backgroundColor: '#5C6BC0',  // Indigo color
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
    width: '80%',
  },
  printButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  addBatchButton: {
    backgroundColor: '#007BFF', // Bootstrap primary color
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
    width: '80%',
  },
  addBatchButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  homeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
    width: '80%',
  },
  homeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
