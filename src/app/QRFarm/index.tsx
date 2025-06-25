import { testConnection } from '@/services/api';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  useEffect(() => {
    testConnection()
      .then(response => {
        console.log('Connected to MongoDB via API:', response);
        // Optional: show success message to user
      })
      .catch(error => {
        console.error('Failed to connect to API:', error);
        // Optional: show error message to user
      });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Welcome to QRFarm
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Generate and scan QR codes with ease
        </ThemedText>
      </ThemedView>
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
  title: {
    fontSize: 32,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.7,
    textAlign: 'center',
  },
});
