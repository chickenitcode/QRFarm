import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface ShipmentData {
  id: string;
  productType: string;
  harvestDate: Date;
  location: string;
  responsibleStaff: string;
  quantity: number;
}

export default function CreateShipmentScreen() {
  const [shipmentData, setShipmentData] = useState<Omit<ShipmentData, 'id' | 'quantity'>>({
    productType: '',
    harvestDate: new Date(),
    location: '',
    responsibleStaff: '',
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [shipmentId, setShipmentId] = useState('');
  
  const updateField = (field: keyof Omit<ShipmentData, 'id' | 'quantity'>, value: any) => {
    setShipmentData(prev => ({ ...prev, [field]: value }));
  };
  
  const createShipment = () => {
    // Validate all required fields
    if (shipmentData.productType.trim() && 
        shipmentData.location.trim() && 
        shipmentData.responsibleStaff.trim()) {
      
      // Generate a unique ID for the shipment
      const uniqueId = 'SHIP-' + Date.now().toString(36).toUpperCase();
      
      // Create the full shipment data with ID and quantity
      const fullShipmentData: ShipmentData = {
        ...shipmentData,
        id: uniqueId,
        quantity: 0 // Initialize quantity to 0
      };
      
      // Save to mock database (in a real app, this would be a DB call)
      saveShipmentToDatabase(fullShipmentData)
        .then(() => {
          // Provide haptic feedback on success
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          
          // Navigate to the product addition screen with the shipment data
          router.push({
            pathname: '/(tabs)/add-child-product',
            params: { 
              shipmentId: uniqueId, 
              shipmentData: JSON.stringify(shipmentData) 
            }
          });
        })
        .catch(error => {
          console.error('Failed to create shipment:', error);
          Alert.alert('Error', 'Failed to create shipment. Please try again.');
        });
    } else {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      
      // Provide haptic feedback on error
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const saveShipmentToDatabase = async (shipment: ShipmentData) => {
    // In a real app, this would save to a database
    console.log('Saving shipment to database:', shipment);
    
    // For demo purposes, we'll simulate an API call with a promise
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Shipment created successfully:', shipment);
        resolve();
      }, 300);
    });
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
    setShipmentData({
      productType: '',
      harvestDate: new Date(),
      location: '',
      responsibleStaff: '',
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
            <ThemedText type="title">Create Shipment</ThemedText>
            <ThemedText style={styles.description}>
              Enter shipment information to begin tracking products
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Agricultural Product Type *</ThemedText>
              <TextInput
                style={styles.input}
                value={shipmentData.productType}
                onChangeText={(text) => updateField('productType', text)}
                placeholder="Enter product type (e.g., Apples, Rice)"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Harvest Date *</ThemedText>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <ThemedText>{formatDate(shipmentData.harvestDate)}</ThemedText>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={shipmentData.harvestDate}
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
                value={shipmentData.location}
                onChangeText={(text) => updateField('location', text)}
                placeholder="Enter harvest location"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Responsible Staff *</ThemedText>
              <TextInput
                style={styles.input}
                value={shipmentData.responsibleStaff}
                onChangeText={(text) => updateField('responsibleStaff', text)}
                placeholder="Enter responsible staff name"
                placeholderTextColor="#999"
              />
            </View>
          </ThemedView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={createShipment}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.buttonText}>Create Shipment</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.resetButton]} 
              onPress={resetForm}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.resetButtonText}>Reset</ThemedText>
            </TouchableOpacity>
          </View>
          
          <ThemedText style={styles.noteText}>
            * The QR code for this shipment will be generated after you add products
          </ThemedText>
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
  dateInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 3,
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
  resetButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resetButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  noteText: {
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
});