import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { BarcodeScanningResult, Camera, CameraView } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ScanForUpdateScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const isFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      console.log('Scanner screen is now focused');
      setScanned(false);
      setIsCameraReady(false);

      const reactivateCamera = async () => {
        console.log('Reactivating camera...');
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      };

      reactivateCamera();

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

  const handleCameraReady = () => {
    console.log('Camera is ready');
    setIsCameraReady(true);
  };

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (!isCameraReady || scanned) return;

    console.log('QR code scanned:', data);
    setScanned(true);

    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      if (data.includes('product.html?id=')) {
        const urlObj = new URL(data);
        const productId = urlObj.searchParams.get('id');

        if (productId) {
          router.navigate({
            pathname: '/QRFarm/update-product',
            params: { productId }
          });
          return;
        }
      } else if (data.includes('batch.html?id=')) {
        const urlObj = new URL(data);
        const batchId = urlObj.searchParams.get('id');

        if (batchId) {
          router.navigate({
            pathname: '/QRFarm/update-batch',
            params: { batchId }
          });
          return;
        }
      } else if (data.includes('/product/')) {
        const urlParts = data.split('/');
        const productId = urlParts[urlParts.length - 1];

        if (productId) {
          router.navigate({
            pathname: '/QRFarm/update-product',
            params: { productId }
          });
          return;
        }
      } else if (data.includes('/batch/')) {
        const urlParts = data.split('/');
        const batchId = urlParts[urlParts.length - 1];

        if (batchId) {
          router.navigate({
            pathname: '/QRFarm/update-batch',
            params: { batchId }
          });
          return;
        }
      } else if (data.startsWith('PROD-')) {
        router.navigate({
          pathname: '/QRFarm/update-product',
          params: { productId: data }
        });
        return;
      } else if (data.startsWith('SHIP-') || data.startsWith('BATCH-')) {
        router.navigate({
          pathname: '/QRFarm/update-batch',
          params: { batchId: data }
        });
        return;
      }

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
        <View style={styles.appBar}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#557089" />
          </TouchableOpacity>
          <ThemedText style={styles.appBarTitle}>QR Scanner</ThemedText>
        </View>
        <ThemedView style={styles.centered}>
          <View style={styles.loadingIcon}>
            <Ionicons name="camera-outline" size={40} color="#557089" />
          </View>
          <ThemedText style={styles.loadingText}>Requesting camera permission...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.appBar}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#557089" />
          </TouchableOpacity>
          <ThemedText style={styles.appBarTitle}>QR Scanner</ThemedText>
        </View>
        <ThemedView style={styles.centered}>
          <View style={styles.permissionIcon}>
            <Ionicons name="camera-off-outline" size={48} color="#557089" />
          </View>
          <ThemedText style={styles.permissionTitle}>Camera Access Needed</ThemedText>
          <ThemedText style={styles.permissionText}>
            Please enable camera permissions in your device settings to scan QR codes.
          </ThemedText>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => {
              Camera.requestCameraPermissionsAsync();
            }}
          >
            <ThemedText style={styles.buttonText}>Try Again</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.scannerContainer}>
        {isFocused ? (
          <CameraView
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['qr']
            }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            onCameraReady={handleCameraReady}
            style={StyleSheet.absoluteFillObject}
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'black' }]} />
        )}

        <View style={styles.overlay}>
          <View style={styles.unfilled} />
          <View style={styles.row}>
            <View style={styles.unfilled} />
            <View style={styles.scanner}>
              {/* Corner indicators */}
              <View style={[styles.cornerIndicator, styles.topLeft]} />
              <View style={[styles.cornerIndicator, styles.topRight]} />
              <View style={[styles.cornerIndicator, styles.bottomLeft]} />
              <View style={[styles.cornerIndicator, styles.bottomRight]} />
            </View>
            <View style={styles.unfilled} />
          </View>
          <View style={styles.unfilled} />
        </View>
        
        <View style={styles.instructionsContainer}>
          <ThemedView style={styles.instructions}>
            <Ionicons name="qr-code-outline" size={22} color="#557089" style={styles.instructionIcon} />
            <ThemedText style={styles.instructionsText}>
              Point your camera at a product or batch QR code
            </ThemedText>
          </ThemedView>
        </View>
      </View>

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
            <Ionicons name="scan-outline" size={20} color="white" style={styles.buttonIcon} />
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
  scanAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  scanBackButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 8,
  },
  scanAppBarTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginLeft: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(176, 199, 86, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#557089',
    textAlign: 'center',
  },
  permissionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(176, 199, 86, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#557089',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    maxWidth: 300,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: '#557089',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
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
    height: 280, // Scanner window height
  },
  scanner: {
    width: 280,
    borderRadius: 12,
    backgroundColor: 'transparent',
    position: 'relative',
    borderWidth: 0,
  },
  cornerIndicator: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#B0C756',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 12,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 44,
    left: 24,
    right: 24,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionIcon: {
    marginRight: 4,
  },
  instructionsText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#557089',
    flex: 1,
  },
  resetButtonContainer: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
  },
  resetButton: {
    backgroundColor: '#557089',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 4,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    padding: 10,
    justifyContent: 'space-around',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabItem: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    flex: 1,
  },
  activeTab: {
    backgroundColor: 'rgba(176, 199, 86, 0.15)',
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: '#557089',
  },
  activeTabText: {
    fontWeight: '600',
  },
});