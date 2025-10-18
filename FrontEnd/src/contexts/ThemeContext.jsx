import React, { createContext, useState, useEffect, useContext } from 'react';
import useDebouncedNavigate from '../hooks/useDebouncedNavigate';

// Create the context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside a ThemeProvider');
  }
  return context;
};

const ThemeNavigator = ({ children, darkMode, toggleDarkMode, colors }) => {
  const debouncedNavigate = useDebouncedNavigate();

  const value = {
    darkMode,
    toggleDarkMode,
    colors,
    debouncedNavigate,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const colors = {
    primary: '#A78800',
    secondary: '#4C4C4C',
    darkBg: '#131313',
    darkCard: '#1F2024',
    lightBg: '#FFFFFF',
    lightText: '#FFFFFF',
    darkText: '#131313',
    mutedText: '#AAAAAA',
    accent1: '#D4AF37',
    accent2: '#805AD5',
    accent3: '#38B2AC',
    accent4: '#E53E3E',
    gradients: {
      gold: 'linear-gradient(135deg, #A78800 0%, #D4AF37 100%)',
      purple: 'linear-gradient(135deg, #6B46C1 0%, #805AD5 100%)',
      teal: 'linear-gradient(135deg, #2C7A7B 0%, #38B2AC 100%)',
    },
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
      },
    },
  };

  return (
    <ThemeNavigator darkMode={darkMode} toggleDarkMode={toggleDarkMode} colors={colors}>
      {children}
    </ThemeNavigator>
  );
};

export default ThemeContext;