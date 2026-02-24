import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import BookmarksScreen from './src/screens/BookmarksScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import { initDatabase } from './src/services/database';
import { loadAIConfig } from './src/services/aiService';
import { getTheme } from './src/utils/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const theme = getTheme(isDark);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) setIsDark(savedTheme === 'dark');
      await loadAIConfig();
      await initDatabase(); // Only creates 2 tiny tables — instant!
      setIsReady(true);
    } catch (error) {
      console.error('Initialization error:', error);
      setIsReady(true);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch { }
  };

  const TabIcon = ({ icon, focused }) => (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
  );

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.loadingLogo, { color: theme.colors.primary }]}>🙏 Bible GPT</Text>
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.spinner} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading your spiritual companion...
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border,
              borderTopWidth: 1,
              paddingTop: 6,
              paddingBottom: 6,
              height: 60,
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.textSecondary,
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
          }}
        >
          <Tab.Screen name="Home" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} /> }}>
            {props => <HomeScreen {...props} isDark={isDark} />}
          </Tab.Screen>
          <Tab.Screen name="Chat" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="💬" focused={focused} /> }}>
            {props => <ChatScreen {...props} isDark={isDark} />}
          </Tab.Screen>
          <Tab.Screen name="Library" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📚" focused={focused} /> }}>
            {props => <LibraryScreen {...props} isDark={isDark} />}
          </Tab.Screen>
          <Tab.Screen name="Bookmarks" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🔖" focused={focused} /> }}>
            {props => <BookmarksScreen {...props} isDark={isDark} />}
          </Tab.Screen>
          <Tab.Screen name="Settings" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" focused={focused} /> }}>
            {props => <SettingsScreen {...props} isDark={isDark} onThemeToggle={toggleTheme} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  loadingLogo: { fontSize: 36, fontWeight: 'bold', marginBottom: 32 },
  spinner: { marginBottom: 16 },
  loadingText: { fontSize: 15, textAlign: 'center' },
});
