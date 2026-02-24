import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import BookmarksScreen from './src/screens/BookmarksScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import services
import { initDatabase } from './src/services/database';
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
      // Initialize database
      await initDatabase();
      
      // Load theme preference
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
      }
      
      setIsReady(true);
    } catch (error) {
      console.error('Initialization error:', error);
      setIsReady(true); // Continue anyway
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

  const TabIcon = ({ icon, focused, color }) => (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.6 }]}>
        {icon}
      </Text>
    </View>
  );

  if (!isReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingLogo, { color: theme.colors.primary }]}>Bible GPT</Text>
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            paddingTop: 8,
            paddingBottom: 8,
            height: 60,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon icon="🏠" focused={focused} color={color} />
            ),
          }}
        >
          {props => <HomeScreen {...props} isDark={isDark} />}
        </Tab.Screen>

        <Tab.Screen
          name="Chat"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon icon="💬" focused={focused} color={color} />
            ),
          }}
        >
          {props => <ChatScreen {...props} isDark={isDark} />}
        </Tab.Screen>

        <Tab.Screen
          name="Library"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon icon="📚" focused={focused} color={color} />
            ),
          }}
        >
          {props => <LibraryScreen {...props} isDark={isDark} />}
        </Tab.Screen>

        <Tab.Screen
          name="Bookmarks"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon icon="🔖" focused={focused} color={color} />
            ),
          }}
        >
          {props => <BookmarksScreen {...props} isDark={isDark} />}
        </Tab.Screen>

        <Tab.Screen
          name="Settings"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon icon="⚙️" focused={focused} color={color} />
            ),
          }}
        >
          {props => <SettingsScreen {...props} isDark={isDark} onThemeToggle={toggleTheme} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  tabIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 24,
  },
});
