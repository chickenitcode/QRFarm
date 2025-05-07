import React from 'react';
import { View, ViewProps, StyleSheet, useColorScheme } from 'react-native';

export function ThemedView({ style, ...props }: ViewProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#1a1a1a' : '#ffffff';
  
  return <View style={[{ backgroundColor }, style]} {...props} />;
}