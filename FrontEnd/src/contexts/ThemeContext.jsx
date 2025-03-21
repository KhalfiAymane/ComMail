// src/contexts/ThemeContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the context
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside a ThemeProvider');
  }
  return context;
};

// Theme Provider with expanded color palette
export const ThemeProvider = ({ children }) => {
  // Get user preference from storage
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    return false; // Default to light mode
  });

  // Update localStorage when mode changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Toggle between dark and light modes
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Enhanced color palette
  const colors = {
    // Core colors (existing)
    primary: '#A78800',
    secondary: '#4C4C4C',
    darkBg: '#131313',
    darkCard: '#1F2024',
    lightBg: '#FFFFFF',
    lightText: '#FFFFFF',
    darkText: '#131313',
    mutedText: '#AAAAAA',
    
    // New accent colors
    accent1: '#D4AF37', // Gold variant (lighter than primary)
    accent2: '#805AD5', // Purple
    accent3: '#38B2AC', // Teal
    accent4: '#E53E3E', // Red for alerts/notifications
    
    // New gradient definitions
    gradients: {
      gold: 'linear-gradient(135deg, #A78800 0%, #D4AF37 100%)',
      purple: 'linear-gradient(135deg, #6B46C1 0%, #805AD5 100%)',
      teal: 'linear-gradient(135deg, #2C7A7B 0%, #38B2AC 100%)',
    },
    
    // New surface colors for cards and sections
    surfaces: {
      dark: {
        level1: '#1F2024',
        level2: '#282A30',
        level3: '#303236',
      },
      light: {
        level1: '#F5F5F5',
        level2: '#EAEAEA',
        level3: '#F9F9F9',
      }
    }
  };

  // Values to share via context
  const value = {
    darkMode,
    toggleDarkMode,
    colors
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;