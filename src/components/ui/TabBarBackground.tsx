import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * TabBarBackground component for better visual appearance of the bottom tab bar
 * Uses BlurView on iOS and a solid background on Android
 */
export default function TabBarBackground() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  
  // On iOS, we can use the BlurView for a more native look
  if (Platform.OS === 'ios') {
    return (
      <BlurView 
        intensity={80} 
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={[styles.blurView, { paddingBottom: insets.bottom }]}
      />
    );
  }
  
  // On Android, use a simple view with a semi-transparent background
  return (
    <View 
      style={[
        styles.androidBackground, 
        { 
          backgroundColor: colorScheme === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          paddingBottom: insets.bottom 
        }
      ]} 
    />
  );
}

const styles = StyleSheet.create({
  blurView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  androidBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(128, 128, 128, 0.3)',
  }
});