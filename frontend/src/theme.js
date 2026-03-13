// Custom Color Theme
export const theme = {
  colors: {
    // Backgrounds
    lightBg: '#F8F2FE',        // Main page background
    cardBg: '#C9B4E0',         // Soft backgrounds / cards
    darkBg: '#3C3867',         // Dark sections
    
    // Text
    darkText: '#242226',       // Primary headings
    mediumGrey: '#79758C',     // Secondary text
    lightText: '#FFFFFF',      // White text on dark backgrounds
    
    // Accents
    darkPurple: '#3C3867',     // Buttons / UI elements
    lightPurple: '#C9B4E0',    // Soft backgrounds / cards
    brightPurple: '#AB51F2',   // Accent color / highlights
    
    // Status colors (keeping for alerts)
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #AB51F2, #C9B4E0)',
    dark: 'linear-gradient(135deg, #3C3867, #242226)',
    light: 'linear-gradient(135deg, #F8F2FE, #C9B4E0)',
  },
  
  // Shadows
  shadows: {
    sm: '0 2px 8px rgba(171, 81, 242, 0.1)',
    md: '0 4px 16px rgba(171, 81, 242, 0.15)',
    lg: '0 8px 32px rgba(171, 81, 242, 0.2)',
    xl: '0 12px 48px rgba(171, 81, 242, 0.25)',
  },
  
  // Border radius
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
};

export default theme;
