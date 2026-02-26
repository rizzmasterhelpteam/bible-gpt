import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getTheme } from '../utils/theme';
import { searchVerses } from '../services/database';
import { useTheme } from '../context/ThemeContext';

const DAILY_KEYWORDS = ['love', 'peace', 'hope', 'strength', 'trust', 'joy', 'faith'];

const HomeScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [dailyVerse, setDailyVerse] = useState(null);

  useEffect(() => {
    loadDailyVerse();
  }, []);

  const loadDailyVerse = async () => {
    try {
      // Pick a random keyword based on the day of the year for variety
      const dayOfYear = Math.floor((Date.now() / 86400000)) % DAILY_KEYWORDS.length;
      const keyword = DAILY_KEYWORDS[dayOfYear];
      const verses = await searchVerses(keyword);
      if (verses.length > 0) {
        const randomVerse = verses[Math.floor(Math.random() * verses.length)];
        setDailyVerse(randomVerse);
      }
    } catch (error) {
      console.error('Error loading daily verse:', error);
    }
  };

  const QuickActionCard = ({ title, subtitle, icon, onPress, color }) => (
    <TouchableOpacity
      style={[styles.actionCard, { backgroundColor: theme.colors.surface }, theme.shadows.md]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
      <Text style={[styles.actionTitle, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Gradient Header */}
        <LinearGradient
          colors={isDark ? ['#4A2C0A', '#1A1A1A'] : ['#F5E6D0', '#FFFFFF']}
          style={styles.header}
        >
          <SafeAreaView edges={['top']}>
            <Text style={[styles.logo, { color: theme.colors.primary }]}>🙏 Bible GPT</Text>
            <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>
              Your Spiritual Companion
            </Text>
          </SafeAreaView>
        </LinearGradient>

        {/* Daily Verse Card */}
        <View style={[styles.verseCard, { backgroundColor: theme.colors.verseBg }, theme.shadows.lg]}>
          <Text style={[styles.verseLabel, { color: theme.colors.primary }]}>
            📖 Daily Verse
          </Text>
          {dailyVerse ? (
            <>
              <Text style={[styles.verseText, { color: theme.colors.text }]}>
                "{dailyVerse.text}"
              </Text>
              <Text style={[styles.verseReference, { color: theme.colors.textSecondary }]}>
                — {dailyVerse.book_name} {dailyVerse.chapter}:{dailyVerse.verse}
              </Text>
            </>
          ) : (
            <Text style={[styles.verseText, { color: theme.colors.text }]}>
              Loading today's encouragement...
            </Text>
          )}
          <TouchableOpacity onPress={loadDailyVerse} style={styles.refreshVerseButton}>
            <Text style={[styles.refreshVerseText, { color: theme.colors.primary }]}>🔄 New Verse</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <QuickActionCard
            title="Chat with Father"
            subtitle="Share your heart"
            icon="chat-processing"
            color={theme.colors.accent}
            onPress={() => navigation.navigate('Chat')}
          />
          <QuickActionCard
            title="Browse Library"
            subtitle="Read Scripture"
            icon="book-open-variant"
            color={theme.colors.primary}
            onPress={() => navigation.navigate('Library')}
          />
        </View>

        <View style={styles.actionsContainer}>
          <QuickActionCard
            title="My Bookmarks"
            subtitle="Saved verses"
            icon="bookmark"
            color="#27AE60"
            onPress={() => navigation.navigate('Bookmarks')}
          />
          <QuickActionCard
            title="Settings"
            subtitle="Customize app"
            icon="cog"
            color="#9B59B6"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>

        {/* Inspirational Quote */}
        <View style={styles.quoteContainer}>
          <Text style={[styles.quoteText, { color: theme.colors.textSecondary }]}>
            "The Lord is my light and my salvation—whom shall I fear?"
          </Text>
          <Text style={[styles.quoteReference, { color: theme.colors.primary }]}>
            — Psalm 27:1
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
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
    alignItems: 'center',
  },
  logo: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  verseCard: {
    marginHorizontal: 24,
    marginVertical: 20,
    padding: 24,
    borderRadius: 16,
  },
  verseLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  verseText: {
    fontSize: 18,
    lineHeight: 28,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  verseReference: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 12,
  },
  refreshVerseButton: {
    alignSelf: 'center',
    marginTop: 4,
  },
  refreshVerseText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 8,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 28,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  quoteContainer: {
    marginHorizontal: 24,
    marginVertical: 32,
    padding: 20,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  quoteReference: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;
