import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme } from '../utils/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            if (savedTheme) {
                setIsDark(savedTheme === 'dark');
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        } finally {
            setIsReady(true);
        }
    };

    const toggleTheme = async () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        try {
            await AsyncStorage.setItem('theme', newIsDark ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const theme = getTheme(isDark);

    const value = {
        isDark,
        theme,
        toggleTheme,
        isReady
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
