import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Read any previously saved preference, default to light
  const [theme, setTheme] = useState(() => localStorage.getItem('studybuddy-theme') || 'light');

  // Whenever theme changes, reflect it on <html> (index.css has [data-theme='dark'] rules
  // that redefine the color variables) and persist the choice
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('studybuddy-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}