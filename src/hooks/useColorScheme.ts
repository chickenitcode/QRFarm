import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ColorScheme = 'light' | 'dark' | null | undefined;
const COLOR_SCHEME_PREFERENCE_KEY = 'QRFarm_color_scheme_preference';

/**
 * Enhanced useColorScheme hook with support for manual theme selection
 * Returns the current color scheme preference ('light' or 'dark')
 * Falls back to system preference if no manual selection is made
 */
export function useColorScheme(): NonNullable<ColorScheme> {
  const systemColorScheme = useNativeColorScheme();
  const [userColorScheme, setUserColorScheme] = useState<ColorScheme>(undefined);

  // Load saved color scheme preference on mount
  useEffect(() => {
    async function loadColorScheme() {
      try {
        const savedScheme = await AsyncStorage.getItem(COLOR_SCHEME_PREFERENCE_KEY);
        if (savedScheme === 'light' || savedScheme === 'dark') {
          setUserColorScheme(savedScheme);
        } else {
          setUserColorScheme(null); // Use system preference
        }
      } catch (error) {
        console.warn('Failed to load color scheme preference:', error);
        setUserColorScheme(null); // Use system preference
      }
    }
    
    loadColorScheme();
  }, []);

  // Save color scheme preference when it changes
  async function setColorScheme(scheme: ColorScheme) {
    try {
      if (scheme === null) {
        await AsyncStorage.removeItem(COLOR_SCHEME_PREFERENCE_KEY);
      } else if (scheme === 'light' || scheme === 'dark') {
        await AsyncStorage.setItem(COLOR_SCHEME_PREFERENCE_KEY, scheme);
      }
      
      setUserColorScheme(scheme);
    } catch (error) {
      console.warn('Failed to save color scheme preference:', error);
    }
  }

  // If loading or using system preference, return system color scheme
  // Otherwise return user preference
  const effectiveColorScheme = userColorScheme === undefined || userColorScheme === null
    ? systemColorScheme
    : userColorScheme;

  // Fallback to light mode if nothing is defined
  return effectiveColorScheme ?? 'light';
}

// Export the setter function as well for theme toggling
export function useThemeToggle() {
  const colorScheme = useColorScheme();
  const [userColorScheme, setUserColorScheme] = useState<ColorScheme>(undefined);

  const toggleTheme = async () => {
    const newScheme = colorScheme === 'dark' ? 'light' : 'dark';
    try {
      await AsyncStorage.setItem(COLOR_SCHEME_PREFERENCE_KEY, newScheme);
      setUserColorScheme(newScheme);
    } catch (error) {
      console.warn('Failed to save color scheme preference:', error);
    }
  };

  return { toggleTheme };
}