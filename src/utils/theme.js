export const colors = {
  // Light theme
  light: {
    primary: '#D4A574',
    secondary: '#F9F7F4',
    accent: '#4A90E2',
    background: '#FFFFFF',
    surface: '#F9F7F4',
    text: '#2C3E50',
    textSecondary: '#7F8C8D',
    border: '#E8E6E3',
    success: '#27AE60',
    error: '#E74C3C',
    warning: '#F39C12',
    userBubble: '#4A90E2',
    aiBubble: '#F9F7F4',
    verseBg: '#FFF9F0',
  },
  // Dark theme
  dark: {
    primary: '#D4A574',
    secondary: '#2C3E50',
    accent: '#4A90E2',
    background: '#1A1A1A',
    surface: '#2C3E50',
    text: '#F9F7F4',
    textSecondary: '#BDC3C7',
    border: '#34495E',
    success: '#27AE60',
    error: '#E74C3C',
    warning: '#F39C12',
    userBubble: '#4A90E2',
    aiBubble: '#2C3E50',
    verseBg: '#34495E',
  }
};

export const typography = {
  fontFamily: {
    regular: 'System',
    serif: 'Georgia',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  }
};

export const getTheme = (isDark = false) => {
  const theme = isDark ? 'dark' : 'light';
  return {
    colors: colors[theme],
    typography,
    spacing,
    borderRadius,
    shadows,
    isDark,
  };
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  getTheme,
};
