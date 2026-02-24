import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import BookmarksScreen from './src/screens/BookmarksScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import services
import { initDatabase } from './src/services/database';
import { loadAIConfig } from './src/services/aiService';
import { getTheme } from './src/utils/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [seedingProgress, setSeedingProgress] = useState(null); // null = not seeding, {done, total} = seeding
  const theme = getTheme(isDark);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) setIsDark(savedTheme === 'dark');

      await loadAIConfig();

      // Pass progress callback — if it triggers, show the seeding screen
      await initDatabase((done, total) => {
        setSeedingProgress({ done, total });
      });

      setIsReady(true);
    } catch (error) {
      console.error('Initialization error:', error);
      setIsReady(true); // continue anyway so app isn't stuck
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const TabIcon = ({ icon, focused }) => (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
  );

  // Show seeding/loading screen
  if (!isReady) {
    const isSeedingBible = seedingProgress !== null;
    return (
      <SafeAreaProvider>
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.loadingLogo, { color: theme.colors.primary }]}>🙏 Bible GPT</Text>

          {isSeedingBible ? (
            <>
              <Text style={[styles.loadingTitle, { color: theme.colors.text }]}>
                Setting Up Your Bible...
              </Text>
              <Text style={[styles.loadingSubtitle, { color: theme.colors.textSecondary }]}>
                Loading {seedingProgress.done} of {seedingProgress.total} books
              </Text>
              <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: theme.colors.primary,
                      width: `${Math.round((seedingProgress.done / seedingProgress.total) * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.loadingHint, { color: theme.colors.textSecondary }]}>
                This only happens once 🙏
              </Text>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color={theme.colors.primary} style={styles.spinner} />
              <Text style={[styles.loadingSubtitle, { color: theme.colors.textSecondary }]}>
                Loading your spiritual companion...
              </Text>
            </>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingLogo: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  loadingHint: {
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  spinner: {
    marginBottom: 16,
  },
});
