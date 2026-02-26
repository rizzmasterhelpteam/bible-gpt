import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTheme } from '../utils/theme';
import { getAIResponse, getAIConfig } from '../services/aiService';
import { saveChatMessage, getChatHistory, clearChatHistory } from '../services/database';
import { useTheme } from '../context/ThemeContext';

const ChatScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const history = await getChatHistory();
      const formattedMessages = history.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at,
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessageContent = inputText.trim();
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessageContent,
      timestamp: new Date().toISOString(),
    };

    // Add user message to state and clear input immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    // Save user message to database
    try {
      await saveChatMessage('user', userMessageContent);
    } catch (error) {
      console.error('Error saving message:', error);
    }

    // Build conversation history INCLUDING the new user message for context
    const conversationHistory = updatedMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Get AI response
    try {
      const aiResponseText = await getAIResponse(userMessageContent, conversationHistory);

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponseText,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
      await saveChatMessage('assistant', aiMessage.content);
    } catch (error) {
      console.error('[CHAT SCREEN] Critical Response Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "My child, I'm having trouble connecting right now. Please check your internet and API configuration. Remember, God is always with you. 🙏",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Chat History',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearChatHistory();
              setMessages([]);
            } catch (error) {
              console.error('Error clearing chat history:', error);
            }
          },
        },
      ]
    );
  };

  const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';
    const bubbleStyle = isUser
      ? { backgroundColor: theme.colors.userBubble, alignSelf: 'flex-end' }
      : { backgroundColor: theme.colors.aiBubble, alignSelf: 'flex-start' };
    const textStyle = isUser ? { color: '#FFFFFF' } : { color: theme.colors.text };

    return (
      <View
        style={[
          styles.messageBubble,
          bubbleStyle,
          theme.shadows.sm,
          { maxWidth: '80%' },
        ]}
      >
        <Text style={[styles.messageText, textStyle]}>{message.content}</Text>
        <Text style={[styles.timestamp, { color: isUser ? 'rgba(255,255,255,0.7)' : theme.colors.textSecondary }]}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.surface }}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Bible GPT</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Chat with Father
            </Text>
          </View>
          {messages.length > 0 && (
            <TouchableOpacity onPress={handleClearHistory} style={styles.clearButton}>
              <Text style={[styles.clearButtonText, { color: theme.colors.error }]}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Welcome, my child
            </Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Share what's on your heart. I'm here to listen and provide comfort from God's Word.
            </Text>
            <View style={styles.suggestionsContainer}>
              {["I'm feeling lonely", "I need encouragement", "I'm worried about the future", "I feel hopeless"].map(suggestion => (
                <TouchableOpacity
                  key={suggestion}
                  style={[styles.suggestionChip, { backgroundColor: theme.colors.surface }]}
                  onPress={() => setInputText(suggestion)}
                >
                  <Text style={[styles.suggestionText, { color: theme.colors.text }]}>
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          messages.map(message => <MessageBubble key={message.id} message={message} />)
        )}

        {isLoading && (
          <View style={[styles.loadingBubble, { backgroundColor: theme.colors.aiBubble }]}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Father is thinking...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: theme.colors.surface }}>
        <View style={[styles.inputContainer, { borderTopColor: theme.colors.border }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.background }]}
            placeholder="Share your heart..."
            placeholderTextColor={theme.colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? theme.colors.accent : theme.colors.border },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 14, marginTop: 2 },
  clearButton: { padding: 8 },
  clearButtonText: { fontSize: 14, fontWeight: '600' },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 8 },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  messageText: { fontSize: 16, lineHeight: 24 },
  timestamp: { fontSize: 11, marginTop: 6, opacity: 0.7 },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 60,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  emptyText: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  suggestionsContainer: { width: '100%', marginTop: 8 },
  suggestionChip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  suggestionText: { fontSize: 14, textAlign: 'center' },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  loadingText: { marginLeft: 8, fontSize: 14 },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

export default ChatScreen;
