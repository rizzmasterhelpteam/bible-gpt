import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { getTheme } from '../utils/theme';
import { getBookmarks } from '../services/database';

const BookmarksScreen = ({ isDark = false }) => {
  const theme = getTheme(isDark);
  const [bookmarks, setBookmarks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const bookmarksData = await getBookmarks();
      setBookmarks(bookmarksData);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookmarks();
    setRefreshing(false);
  };

  const BookmarkCard = ({ bookmark }) => (
    <View style={[styles.bookmarkCard, { backgroundColor: theme.colors.verseBg }]}>
      <View style={styles.bookmarkHeader}>
        <Text style={[styles.bookmarkReference, { color: theme.colors.primary }]}>
          {bookmark.book_name} {bookmark.chapter}:{bookmark.verse}
        </Text>
        <Text style={styles.bookmarkIcon}>🔖</Text>
      </View>
      <Text style={[styles.bookmarkText, { color: theme.colors.text }]}>
        {bookmark.text}
      </Text>
      <Text style={[styles.bookmarkDate, { color: theme.colors.textSecondary }]}>
        Saved {new Date(bookmark.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Bookmarks</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {bookmarks.length} saved {bookmarks.length === 1 ? 'verse' : 'verses'}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        {bookmarks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔖</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No bookmarks yet</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Start bookmarking your favorite verses from the Library
            </Text>
          </View>
        ) : (
          bookmarks.map(bookmark => <BookmarkCard key={bookmark.id} bookmark={bookmark} />)
        )}
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
  bookmarkCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  bookmarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookmarkReference: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bookmarkIcon: {
    fontSize: 20,
  },
  bookmarkText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  bookmarkDate: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 120,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default BookmarksScreen;
