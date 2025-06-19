const tintColorLight = '#0a7ea4';
const tintColorDark = '#38b6ff';

export const Colors = {
  light: {
    text: '#000000',
    background: '#f9f9f9',
    tint: tintColorLight,
    tabIconDefault: '#8e8e93',
    tabIconSelected: tintColorLight,
    card: '#ffffff',
    border: '#e1e1e1',
    notification: '#ff3b30',
    primary: '#0a7ea4',
    secondary: '#4CAF50',
    accent: '#ff9500',
    error: '#ff3b30',
    success: '#34c759',
    warning: '#ffcc00',
  },
  dark: {
    text: '#ffffff',
    background: '#121212',
    tint: tintColorDark,
    tabIconDefault: '#8e8e93',
    tabIconSelected: tintColorDark,
    card: '#1c1c1e',
    border: '#38383a',
    notification: '#ff453a',
    primary: '#38b6ff',
    secondary: '#66bb6a',
    accent: '#ff9f0a',
    error: '#ff453a',
    success: '#30d158',
    warning: '#ffd60a',
  },
};

// Type definitions for theme colors
export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof Colors.light;