import { useFocusEffect } from '@react-navigation/native';
import { BarcodeScanningResult, Camera, CameraView } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ScanForUpdateScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Add this useFocusEffect to reset scanning state when screen gets focus
  useFocusEffect(
    useCallback(() => {
      console.log('Scanner screen is now focused');
      // Reset scanning state when screen comes into focus
      setScanned(false);
      
      // Return cleanup function
      return () => {
        console.log('Scanner screen is losing focus');
      };
    }, [])
  );

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  // Add this handler for camera readiness
  const handleCameraReady = () => {
    console.log('Camera is ready');
    setIsCameraReady(true);
  };

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    // Only process scan if camera is ready and not already scanned
    if (!isCameraReady || scanned) return;
    
    console.log('QR code scanned:', data);
    setScanned(true);
    
    // Provide haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    try {

      // NEW: Check for product.html?id= format
      if (data.includes('product.html?id=')) {
        // Extract the ID from URL query parameter
        const urlObj = new URL(data);
        const productId = urlObj.searchParams.get('id');
        
        if (productId) {
          router.navigate({
            pathname: '/(tabs)/update-product',
            params: { productId }
          });
          return;
        }
      } 
      // NEW: Check for batch.html?id= format
      else if (data.includes('batch.html?id=')) {
        // Extract the ID from URL query parameter
        const urlObj = new URL(data);
        const batchId = urlObj.searchParams.get('id');
        
        if (batchId) {
          router.navigate({
            pathname: '/(tabs)/update-batch',
            params: { batchId }
          });
          return;
        }
      }
      // LEGACY: Keep old URL format checks for backward compatibility
      else if (data.includes('/product/')) {
        // Extract ID from URL like https://yourdomain.com/product/PROD-123
        const urlParts = data.split('/');
        const productId = urlParts[urlParts.length - 1];
        
        if (productId) {
          router.navigate({
            pathname: '/(tabs)/update-product',
            params: { productId }
          });
          return;
        }
      } 
      // LEGACY: Check if it's a batch QR code in old format
      else if (data.includes('/batch/')) {
        // Extract ID from URL like https://yourdomain.com/batch/SHIP-123
        const urlParts = data.split('/');
        const batchId = urlParts[urlParts.length - 1];
        
        if (batchId) {
          router.navigate({
            pathname: '/(tabs)/update-batch',
            params: { batchId }
          });
          return;
        }
      }
      // Check direct ID formats (without URL)
      else if (data.startsWith('PROD-')) {
        router.navigate({
          pathname: '/(tabs)/update-product',
          params: { productId: data }
        });
        return;
      }
      else if (data.startsWith('SHIP-') || data.startsWith('BATCH-')) {
        router.navigate({
          pathname: '/(tabs)/update-batch',
          params: { batchId: data }
        });
        return;
      }
      
      // If we get here, the QR code wasn't recognized
      Alert.alert(
        'Invalid QR Code', 
        'Could not identify a valid product or batch QR code.',
        [{ text: 'Try Again', onPress: () => setScanned(false) }]
      );
      
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert(
        'Error Reading QR Code',
        'The scanned QR code could not be processed.',
        [{ text: 'Try Again', onPress: () => setScanned(false) }]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.content}>
          <ThemedText>Requesting camera permission...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.content}>
          <ThemedText>No access to camera</ThemedText>
          <ThemedText style={styles.permissionText}>
            Please enable camera permissions in your device settings to scan QR codes.
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.scannerContainer}>
        <CameraView
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr']
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          onCameraReady={handleCameraReady}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.overlay}>
          <View style={styles.unfilled} />
          <View style={styles.row}>
            <View style={styles.unfilled} />
            <View style={styles.scanner} />
            <View style={styles.unfilled} />
          </View>
          <View style={styles.unfilled} />
        </View>
        <View style={styles.instructionsContainer}>
          <ThemedView style={styles.instructions}>
            <ThemedText style={styles.instructionsText}>
              Scan a product or batch QR code to update
            </ThemedText>
          </ThemedView>
        </View>
      </View>
      
      {/* Add a manual reset button for testing */}
      {scanned && (
        <View style={styles.resetButtonContainer}>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => {
              console.log('Manually resetting scanner');
              setScanned(false);
              setIsCameraReady(false);
            }}
          >
            <ThemedText style={styles.resetButtonText}>Scan Again</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    marginTop: 10,
    textAlign: 'center',
    opacity: 0.7,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    flex: 1,
  },
  unfilled: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  row: {
    flexDirection: 'row',
    height: 250, // Scanner window height
  },
  scanner: {
    width: 250,
    borderWidth: 2,
    borderColor: '#0a7ea4',
    backgroundColor: 'transparent',
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  instructions: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  instructionsText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  resetButtonContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
  },
  resetButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});