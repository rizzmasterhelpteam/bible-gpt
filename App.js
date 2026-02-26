import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import BookmarksScreen from './src/screens/BookmarksScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import { initDatabase } from './src/services/database';
import { loadAIConfig } from './src/services/aiService';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, color, size, focused }) => (
  <MaterialCommunityIcons
    name={name}
    size={size || 24}
    color={color}
    style={{ opacity: focused ? 1 : 0.6 }}
  />
);

function AppNavigator() {
  const { theme, isReady, toggleTheme } = useTheme();
  const [initComplete, setInitComplete] = React.useState(false);

  React.useEffect(() => {
    const initialize = async () => {
      try {
        await loadAIConfig();
        await initDatabase();
        setInitComplete(true);
      } catch (error) {
        console.error('Initialization error:', error);
        setInitComplete(true);
      }
    };
    initialize();
  }, []);

  if (!isReady || !initComplete) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingLogo, { color: theme.colors.primary }]}>🙏 Bible GPT</Text>
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.spinner} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading your spiritual companion...
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
            paddingTop: 6,
            paddingBottom: 6,
            height: 60,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: (props) => <TabIcon name="home" {...props} /> }} />
        <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarIcon: (props) => <TabIcon name="chat-processing" {...props} /> }} />
        <Tab.Screen name="Library" component={LibraryScreen} options={{ tabBarIcon: (props) => <TabIcon name="book-open-variant" {...props} /> }} />
        <Tab.Screen name="Bookmarks" component={BookmarksScreen} options={{ tabBarIcon: (props) => <TabIcon name="bookmark" {...props} /> }} />
        <Tab.Screen name="Settings" options={{ tabBarIcon: (props) => <TabIcon name="cog" {...props} /> }}>
          {props => <SettingsScreen {...props} onThemeToggle={toggleTheme} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  loadingLogo: { fontSize: 36, fontWeight: 'bold', marginBottom: 32 },
  spinner: { marginBottom: 16 },
  loadingText: { fontSize: 15, textAlign: 'center' },
});
