import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

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
  const shipmentId = params.shipmentId as string;
  const shipmentDataString = params.shipmentData as string;
  
  const [shipmentData, setShipmentData] = useState<any>(null);
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
  const [showShipmentQR, setShowShipmentQR] = useState(false);
  const [shipmentQRValue, setShipmentQRValue] = useState('');
  const [showProductQR, setShowProductQR] = useState(false);
  
  useEffect(() => {
    if (shipmentDataString) {
      try {
        const parsed = JSON.parse(shipmentDataString);
        setShipmentData(parsed);
      } catch (error) {
        console.error('Failed to parse shipment data:', error);
      }
    }
  }, [shipmentDataString]);
  
  const updateField = (field: keyof Omit<ChildProductData, 'id' | 'parentId'>, value: string | number) => {
    setChildProduct(prev => ({ ...prev, [field]: value }));
  };
  
  const generateChildQR = () => {
    // Validate required fields
    if (childProduct.weight && childProduct.size.trim()) {
      
      // Generate a unique ID for the child product
      const uniqueId = `PROD-${shipmentId}-${(productCount + 1).toString().padStart(3, '0')}`;
      setProductId(uniqueId);
      
      // Create initial block (block 0) - producer's information
      const initialBlockData = {
        productDetails: {
          weight: childProduct.weight,
          size: childProduct.size,
          quality: childProduct.quality || 'Standard',
        },
        shipment: shipmentId,
        notes: childProduct.additionalNotes || '',
      };
      
      // Calculate hash for the initial block
      const initialBlockHash = calculateHash(0, 0, JSON.stringify(initialBlockData));
      
      const initialBlock: ProductBlock = {
        blockId: 0,
        timestamp: Date.now(),
        actor: 'Producer', // Default for the initial block
        actorType: 'producer' as 'producer', // Cast to specific union type
        location: shipmentData?.location || 'Unknown',
        data: initialBlockData,
        prevHash: '0', // Genesis block has prevHash of 0
        hash: initialBlockHash
      };
      
      // Create the full child product data with blockchain structure
      const fullChildData = {
        ...childProduct,
        id: uniqueId,
        parentId: shipmentId,
        blocks: [initialBlock]
      };
      
      // Save product data to your backend
      saveChildProductToDatabase(fullChildData);
      
      // Also add this product to the parent shipment's product list
      addProductToShipment(shipmentId, uniqueId);
      
      // For local testing, save to localStorage if available
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(`product_${uniqueId}`, JSON.stringify(fullChildData));
        } catch (e) {
          console.log('Could not save to localStorage:', e);
        }
      }
      
      // Create QR URL using the new pattern for products
      const qrUrl = `https://yourdomain.com/product/${uniqueId}`;
      
      setQrValue(qrUrl);
      setShowProductQR(true);
      setShowShipmentQR(false);
      
      // Increase the product count
      setProductCount(prev => prev + 1);
      
      // Provide haptic feedback on success
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
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
  
  // Add this function to keep track of products in a shipment
  const addProductToShipment = (shipmentId: string, productId: string) => {
    try {
      // In a real app, you would call an API to update the shipment
      console.log(`Adding product ${productId} to shipment ${shipmentId}`);
      
      // For demo purposes, use localStorage to track shipment contents
      if (typeof localStorage !== 'undefined') {
        // Get current products in shipment
        const shipmentProductsKey = `shipment_products_${shipmentId}`;
        const currentProducts = JSON.parse(localStorage.getItem(shipmentProductsKey) || '[]');
        
        // Add the new product
        currentProducts.push(productId);
        
        // Save back to localStorage
        localStorage.setItem(shipmentProductsKey, JSON.stringify(currentProducts));
      }
    } catch (e) {
      console.error('Error adding product to shipment:', e);
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
    setShowQR(false);
  };

  const completeShipment = () => {
    if (productCount === 0) {
      Alert.alert(
        'No Products Added',
        'Please add at least one product before completing the shipment.',
        [{ text: 'OK' }]
      );
      return;
    }
  
    // Create updated shipment data with new quantity
    const updatedShipment = {
      ...JSON.parse(shipmentDataString),
      id: shipmentId,
      quantity: productCount
    };
    
    // Save the updated shipment to database
    updateShipmentInDatabase(updatedShipment)
      .then(() => {
        // Set the final shipment QR URL with the new pattern
        const shipmentQrUrl = `https://yourdomain.com/batch/${shipmentId}`;
        
        // Show success alert with options to view QR or go home
        Alert.alert(
          'Shipment Completed',
          `Shipment ${shipmentId} has been completed with ${productCount} products.`,
          [
            { 
              text: 'View Shipment QR', 
              onPress: () => {
                // Show the final shipment QR code
                setShowQR(false);
                setShipmentQRValue(shipmentQrUrl);
                setShowShipmentQR(true);
              } 
            },
            { 
              text: 'Done', 
              onPress: () => router.navigate('/(tabs)')
            }
          ]
        );
      })
      .catch(error => {
        console.error('Failed to update shipment:', error);
        Alert.alert(
          'Error',
          'Failed to update shipment quantity. Please try again.',
          [{ text: 'OK' }]
        );
      });
  };

  // Function to update the shipment in database
  const updateShipmentInDatabase = async (shipment: any) => {
    // In a real app, this would update the shipment in your database
    console.log('Updating shipment with new quantity:', shipment);
    
    // For demo purposes, we'll simulate an API call with a promise
    return new Promise<void>((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        // Log the updated shipment
        console.log('Shipment updated successfully:', shipment);
        
        // Provide haptic feedback on success
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        resolve();
      }, 500); // Simulate half-second delay
    });
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
            <ThemedText type="title">Add Product to Shipment</ThemedText>
            <ThemedText style={styles.description}>
              Shipment ID: {shipmentId}
            </ThemedText>
            {shipmentData && (
              <ThemedText style={styles.shipmentInfo}>
                {shipmentData.productType} - {productCount} products added
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
                Part of Shipment: {shipmentId}
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
                  onPress={completeShipment}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.completeButtonText}>
                    Complete Shipment
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
                  onPress={completeShipment}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.completeButtonText}>
                    Complete Shipment
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          )}

          {showShipmentQR && (
            <ThemedView style={styles.qrContainer}>
              <QRCode
                value={shipmentQRValue}
                size={200}
                backgroundColor="white"
                color="black"
              />
              <ThemedText style={styles.resultText}>
                Shipment QR Generated - ID: {shipmentId}
              </ThemedText>
              <ThemedText style={styles.infoText}>
                Quantity: {productCount}
              </ThemedText>
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
  shipmentInfo: {
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
  shipmentTitle: {
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
});

function setShowProductQR(arg0: boolean) {
  throw new Error('Function not implemented.');
}
