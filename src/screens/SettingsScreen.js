import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateAIConfig, getAIConfig } from '../services/aiService';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen = ({ navigation }) => {
  const { theme, isDark, toggleTheme: onThemeToggle } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('openai');
  const [fontSize, setFontSize] = useState('medium');
  const [showApiConfig, setShowApiConfig] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const config = getAIConfig();
      const savedFontSize = await AsyncStorage.getItem('font_size');

      if (config.apiKey) setApiKey(config.apiKey);
      if (config.provider) setProvider(config.provider);
      if (savedFontSize) setFontSize(savedFontSize);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    try {
      await AsyncStorage.setItem('ai_api_key', apiKey);
      await AsyncStorage.setItem('ai_provider', provider);

      updateAIConfig({
        apiKey: apiKey,
        provider: provider,
      });

      Alert.alert('Success', 'API configuration saved! You can now chat with the AI.');
      setShowApiConfig(false);
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', 'Failed to save API key');
    }
  };

  const handleFontSizeChange = async (size) => {
    setFontSize(size);
    try {
      await AsyncStorage.setItem('font_size', size);
    } catch (error) {
      console.error('Error saving font size:', error);
    }
  };

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      {children}
    </View>
  );

  const SettingRow = ({ label, rightComponent }) => (
    <View style={[styles.settingRow, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{label}</Text>
      {rightComponent}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Settings</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Customize your experience
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* App Info */}
        <SettingSection title="About Bible GPT">
          <View style={[styles.infoCard, { backgroundColor: theme.colors.verseBg }]}>
            <Text style={[styles.appName, { color: theme.colors.primary }]}>Bible GPT</Text>
            <Text style={[styles.appVersion, { color: theme.colors.textSecondary }]}>Version 1.0.0</Text>
            <Text style={[styles.appDescription, { color: theme.colors.text }]}>
              Your spiritual companion providing comfort and guidance through God's Word with AI assistance.
            </Text>
          </View>
        </SettingSection>

        {/* Appearance */}
        <SettingSection title="Appearance">
          <SettingRow
            label="Dark Mode"
            rightComponent={
              <Switch
                value={isDark}
                onValueChange={onThemeToggle}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingRow
            label="Reading Font Size"
            rightComponent={
              <View style={styles.fontSizeButtons}>
                {['small', 'medium', 'large'].map(size => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.fontSizeButton,
                      {
                        backgroundColor: fontSize === size ? theme.colors.primary : theme.colors.border
                      }
                    ]}
                    onPress={() => handleFontSizeChange(size)}
                  >
                    <Text
                      style={[
                        styles.fontSizeButtonText,
                        { color: fontSize === size ? '#FFFFFF' : theme.colors.text }
                      ]}
                    >
                      {size[0].toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            }
          />
        </SettingSection>

        {/* AI Configuration */}
        <SettingSection title="AI Configuration">
          <TouchableOpacity
            style={[styles.configButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => setShowApiConfig(!showApiConfig)}
          >
            <Text style={[styles.configButtonText, { color: theme.colors.text }]}>
              {showApiConfig ? '▼' : '▶'} Configure AI API
            </Text>
          </TouchableOpacity>

          {showApiConfig && (
            <View style={[styles.apiConfig, { backgroundColor: theme.colors.verseBg }]}>
              <Text style={[styles.apiConfigLabel, { color: theme.colors.text }]}>Provider</Text>
              <View style={styles.providerButtons}>
                {['openai', 'anthropic', 'groq', 'gemini'].map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.providerButton,
                      {
                        backgroundColor: provider === p ? theme.colors.accent : theme.colors.border
                      }
                    ]}
                    onPress={() => setProvider(p)}
                  >
                    <Text
                      style={[
                        styles.providerButtonText,
                        { color: provider === p ? '#FFFFFF' : theme.colors.text }
                      ]}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.apiConfigLabel, { color: theme.colors.text }]}>API Key ({provider})</Text>
              <TextInput
                style={[styles.apiInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                placeholder={`Enter your ${provider} API key`}
                placeholderTextColor={theme.colors.textSecondary}
                value={apiKey}
                onChangeText={setApiKey}
                secureTextEntry
              />

              <Text style={[styles.apiConfigHelp, { color: theme.colors.textSecondary }]}>
                {provider === 'openai' && "Get your key from platform.openai.com. (Paid API)"}
                {provider === 'anthropic' && "Get your key from console.anthropic.com. (Paid API)"}
                {provider === 'groq' && "Get your FREE key from console.groq.com. (High speed!)"}
                {provider === 'gemini' && "Get your FREE key from aistudio.google.com. (Highly recommended!)"}
                {"\n\nWithout an API key, the app will use basic fallback responses."}
              </Text>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSaveApiKey}
              >
                <Text style={styles.saveButtonText}>Save API Configuration</Text>
              </TouchableOpacity>
            </View>
          )}
        </SettingSection>

        {/* Support */}
        <SettingSection title="Support">
          <TouchableOpacity
            style={[styles.settingRow, { backgroundColor: theme.colors.surface }]}
            onPress={() => Alert.alert('Help', 'Bible GPT helps you find comfort in Scripture. Chat with Father to share your struggles and receive encouragement.')}
          >
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Help & Tutorial</Text>
            <Text style={[styles.settingArrow, { color: theme.colors.textSecondary }]}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingRow, { backgroundColor: theme.colors.surface }]}
            onPress={() => Alert.alert('Feedback', 'Thank you for using Bible GPT! Your feedback helps us improve.')}
          >
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Send Feedback</Text>
            <Text style={[styles.settingArrow, { color: theme.colors.textSecondary }]}>→</Text>
          </TouchableOpacity>
        </SettingSection>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Made with ❤️ for spiritual growth
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingArrow: {
    fontSize: 18,
  },
  infoCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  fontSizeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  fontSizeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSizeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  configButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  configButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  apiConfig: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  apiConfigLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  providerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  providerButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: '22%',
  },
  providerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  apiInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 8,
  },
  apiConfigHelp: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
});

export default SettingsScreen;
