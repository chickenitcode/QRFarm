import { BarcodeScanningResult, Camera, CameraView } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ScanForUpdateScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    setScanned(true);
    
    // Provide haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Check if the QR contains a URL with a product ID
    try {
      // Extract the product ID from the URL
      let productId;
      
      if (data.includes('/product/')) {
        // Extract ID from URL like https://yourdomain.com/product/PROD-123
        const urlParts = data.split('/');
        productId = urlParts[urlParts.length - 1];
      } else {
        // If it's not a URL, check if it's directly a product ID
        if (data.startsWith('PROD-')) {
          productId = data;
        } else {
          throw new Error('Invalid QR code format');
        }
      }
      
      // Navigate to update screen with the product ID
      if (productId) {
        router.navigate({
          pathname: '/(tabs)/update-product',
          params: { productId }
        });
      } else {
        Alert.alert('Invalid QR Code', 'Could not find a valid product ID in the QR code.');
        setScanned(false);
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert(
        'Error Reading QR Code',
        'The scanned QR code does not contain valid product information.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
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
              Scan a product QR code to update its information
            </ThemedText>
          </ThemedView>
        </View>
      </View>
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
});