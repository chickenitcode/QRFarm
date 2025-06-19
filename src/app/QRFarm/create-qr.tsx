import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { saveBatch } from '@/services/api';

interface BatchData {
  id: string;
  productType: string;
  harvestDate: Date;
  location: string;
  responsibleStaff: string;
  quantity: number;
  blocks?: BatchBlock[];
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

export default function CreateBatchScreen() {
  const [batchData, setBatchData] = useState<Omit<BatchData, 'id' | 'quantity'>>({
    productType: '',
    harvestDate: new Date(),
    location: '',
    responsibleStaff: '',
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [batchId, setBatchId] = useState('');
  
  const updateField = (field: keyof Omit<BatchData, 'id' | 'quantity'>, value: any) => {
    setBatchData(prev => ({ ...prev, [field]: value }));
  };

  const calculateHash = (blockId: number, prevHash: string | number, data: string, timestamp: number) => {
    const dataToHash = `${blockId}:${prevHash}:${data}:${timestamp}`;
    
    return Array.from(dataToHash)
        .reduce((hash, char) => {
            const charCode = char.charCodeAt(0);
            hash = (hash ^ (charCode + ((hash << 5) - hash))) | 0; // force int32
            return hash;
        }, 0)
        .toString(16);
  };
  
  const createBatch = () => {
    // Validate all required fields
    if (batchData.productType.trim() && 
        batchData.location.trim() && 
        batchData.responsibleStaff.trim()) {
      
      // Generate a unique ID for the batch
      const uniqueId = 'BATCH-' + Date.now().toString(36).toUpperCase();
      
      // Create initial block data
      const initialBlockData = {
        productType: batchData.productType,
        harvestDate: batchData.harvestDate,
        location: batchData.location,
        responsibleStaff: batchData.responsibleStaff,
        action: 'batch_created'
      };
      
      // Calculate hash for the initial block
      const initialBlockHash = calculateHash(0, '0', JSON.stringify(initialBlockData), Date.now());
      
      // Create genesis block for this batch
      const genesisBlock = {
        blockId: 0,
        timestamp: Date.now(),
        actor: batchData.responsibleStaff,
        location: batchData.location,
        data: initialBlockData,
        prevHash: '0', // Genesis block has prevHash of 0
        hash: initialBlockHash
      };
      
      // Create the full batch data with ID, quantity, and blockchain
      const fullBatchData = {
        ...batchData,
        id: uniqueId,
        quantity: 0, // Initialize quantity to 0
        blocks: [genesisBlock]
      };
      
      // Save to MongoDB through the API
      saveBatch(fullBatchData)
        .then(() => {
          // Provide haptic feedback on success
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          
          // Navigate to the product addition screen with the batch data
          router.push({
            pathname: '/QRFarm/add-child-product',
            params: { 
              batchId: uniqueId, 
              batchData: JSON.stringify({
                ...batchData,
                id: uniqueId
              }) 
            }
          });
        })
        .catch(error => {
          console.error('Failed to create batch:', error);
          Alert.alert('Error', 'Failed to create batch. Please try again.');
        });
    } else {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      
      // Provide haptic feedback on error
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateField('harvestDate', selectedDate);
    }
  };

  const resetForm = () => {
    setBatchData({
      productType: '',
      harvestDate: new Date(),
      location: '',
      responsibleStaff: '',
    });
  };

  // Add this hook to reset form when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Reset form state when screen comes into focus
      setBatchData({
        productType: '',
        harvestDate: new Date(),
        location: '',
        responsibleStaff: '',
      });
      setShowDatePicker(false);
      setBatchId('');
      
      return () => {
        // Clean up if needed
      };
    }, [])
  );

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
            <ThemedText style={styles.description}>
              Enter batch information to begin tracking products
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Agricultural Product Type *</ThemedText>
              <TextInput
                style={styles.input}
                value={batchData.productType}
                onChangeText={(text) => updateField('productType', text)}
                placeholder="Enter product type (e.g., Apples, Rice)"
                placeholderTextColor="#8A8A8A"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Harvest Date *</ThemedText>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <ThemedText style={styles.dateText}>{formatDate(batchData.harvestDate)}</ThemedText>
                <Ionicons name="calendar-outline" size={20} color="#557089" />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={batchData.harvestDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Location *</ThemedText>
              <TextInput
                style={styles.input}
                value={batchData.location}
                onChangeText={(text) => updateField('location', text)}
                placeholder="Enter harvest location"
                placeholderTextColor="#8A8A8A"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Responsible Staff *</ThemedText>
              <TextInput
                style={styles.input}
                value={batchData.responsibleStaff}
                onChangeText={(text) => updateField('responsibleStaff', text)}
                placeholder="Enter responsible staff name"
                placeholderTextColor="#8A8A8A"
              />
            </View>
          </ThemedView>
          
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle-outline" size={18} color="#557089" />
            <ThemedText style={styles.noteText}>
              The QR code for this batch will be generated after you add products
            </ThemedText>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={resetForm}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.resetButtonText}>Reset</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.createButton} 
              onPress={createBatch}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.createButtonText}>Create Batch</ThemedText>
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
  keyboardAvoid: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#B0C756',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
    color: '#557089',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  description: {
    fontSize: 16,
    color: '#557089',
    lineHeight: 22,
  },
  formContainer: {
    gap: 22,
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#557089',
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(176, 199, 86, 0.3)',
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dateInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(176, 199, 86, 0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  createButton: {
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
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#557089',
  },
  resetButtonText: {
    color: '#557089',
    fontWeight: '600',
    fontSize: 16,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(176, 199, 86, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#557089',
  },
  bottomNav: {
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
  navItem: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
  },
  activeNavItem: {
    backgroundColor: 'rgba(176, 199, 86, 0.15)',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#557089',
  },
  activeNavText: {
    fontWeight: '600',
  }
});