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
} from 'react-native';
import { getTheme } from '../utils/theme';
import { getAIResponse } from '../services/aiService';
import { saveChatMessage, getChatHistory, clearChatHistory } from '../services/database';

const ChatScreen = ({ isDark = false }) => {
  const theme = getTheme(isDark);
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

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Save user message to database
    try {
      await saveChatMessage('user', userMessage.content);
    } catch (error) {
      console.error('Error saving message:', error);
    }

    // Get AI response
    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const aiResponseText = await getAIResponse(userMessage.content, conversationHistory);

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponseText,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
      await saveChatMessage('assistant', aiMessage.content);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "My child, I'm having trouble connecting right now. Please try again in a moment. Remember, God is always with you. 🙏",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearChatHistory();
      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';
    const bubbleStyle = isUser
      ? { backgroundColor: theme.colors.userBubble, alignSelf: 'flex-end' }
      : { backgroundColor: theme.colors.aiBubble, alignSelf: 'flex-start' };

    const textStyle = isUser
      ? { color: '#FFFFFF' }
      : { color: theme.colors.text };

    // Check if message contains verse references (format: Book Chapter:Verse)
    const hasVerseFormat = message.content.includes('📖');

    return (
      <View
        style={[
          styles.messageBubble,
          bubbleStyle,
          theme.shadows.sm,
          { maxWidth: '80%' }
        ]}
      >
        <Text style={[styles.messageText, textStyle, hasVerseFormat && styles.verseText]}>
          {message.content}
        </Text>
        <Text style={[styles.timestamp, { color: isUser ? '#FFFFFF' : theme.colors.textSecondary }]}>
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
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Bible GPT</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Chat with Abba
          </Text>
        </View>
        {messages.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory} style={styles.clearButton}>
            <Text style={[styles.clearButtonText, { color: theme.colors.error }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon]}>💬</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Welcome, my child
            </Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Share what's on your heart. I'm here to listen and provide comfort from God's Word.
            </Text>
            <View style={styles.suggestionsContainer}>
              <TouchableOpacity
                style={[styles.suggestionChip, { backgroundColor: theme.colors.surface }]}
                onPress={() => setInputText("I'm feeling lonely")}
              >
                <Text style={[styles.suggestionText, { color: theme.colors.text }]}>
                  I'm feeling lonely
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.suggestionChip, { backgroundColor: theme.colors.surface }]}
                onPress={() => setInputText("I need encouragement")}
              >
                <Text style={[styles.suggestionText, { color: theme.colors.text }]}>
                  I need encouragement
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.suggestionChip, { backgroundColor: theme.colors.surface }]}
                onPress={() => setInputText("I'm worried about the future")}
              >
                <Text style={[styles.suggestionText, { color: theme.colors.text }]}>
                  I'm worried about the future
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          messages.map(message => <MessageBubble key={message.id} message={message} />)
        )}

        {isLoading && (
          <View style={[styles.loadingBubble, { backgroundColor: theme.colors.aiBubble }]}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Abba is thinking...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          placeholder="Share your heart..."
          placeholderTextColor={theme.colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: inputText.trim() ? theme.colors.accent : theme.colors.border }
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  verseText: {
    lineHeight: 24,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  suggestionsContainer: {
    width: '100%',
    marginTop: 16,
  },
  suggestionChip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginLeft: 8,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatScreen;
