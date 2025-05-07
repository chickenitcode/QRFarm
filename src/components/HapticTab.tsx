import React from 'react';
import { TouchableOpacity, Platform, GestureResponderEvent } from 'react-native';
import * as Haptics from 'expo-haptics';

type HapticTabProps = {
  accessibilityState?: { selected?: boolean };
  onPress?: (e: GestureResponderEvent) => void;
  children: React.ReactNode;
  style?: any;
};

/**
 * HapticTab component that provides haptic feedback when pressed
 * To be used as tabBarButton in the tab navigator
 */
export function HapticTab({ 
  accessibilityState, 
  children, 
  onPress, 
  style 
}: HapticTabProps) {
  
  const handlePress = (e: GestureResponderEvent) => {
    // Only provide haptic feedback on iOS - Android has its own feedback
    if (Platform.OS === 'ios') {
      // Provide lighter feedback if already selected
      const isSelected = accessibilityState?.selected;
      if (isSelected) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
    
    // Pass the event to the original onPress handler
    onPress?.(e);
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      onPress={handlePress}
      style={style}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
}