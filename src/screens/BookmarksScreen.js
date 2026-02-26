import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getTheme } from '../utils/theme';
import { getBookmarks, deleteBookmark } from '../services/database';
import { useTheme } from '../context/ThemeContext';

const BookmarksScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [bookmarks, setBookmarks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { loadBookmarks(); }, []));

  const loadBookmarks = async () => {
    try {
      setBookmarks(await getBookmarks());
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookmarks();
    setRefreshing(false);
  };

  const handleDelete = (bookmark) => {
    Alert.alert(
      'Remove Bookmark',
      `Remove "${bookmark.book_name} ${bookmark.chapter}:${bookmark.verse}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            try {
              await deleteBookmark(bookmark.id);
              setBookmarks(prev => prev.filter(b => b.id !== bookmark.id));
            } catch (e) {
              Alert.alert('Error', 'Could not remove bookmark.');
            }
          },
        },
      ]
    );
  };

  const BookmarkCard = ({ bookmark }) => (
    <View style={[styles.bookmarkCard, { backgroundColor: theme.colors.verseBg }, theme.shadows.sm]}>
      <View style={styles.bookmarkHeader}>
        <Text style={[styles.bookmarkReference, { color: theme.colors.primary }]}>
          📖 {bookmark.book_name} {bookmark.chapter}:{bookmark.verse}
        </Text>
        <TouchableOpacity onPress={() => handleDelete(bookmark)} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.bookmarkText, { color: theme.colors.text }]}>{bookmark.text}</Text>
      <Text style={[styles.bookmarkDate, { color: theme.colors.textSecondary }]}>
        Saved {new Date(bookmark.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.surface }}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Bookmarks</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            {bookmarks.length} saved {bookmarks.length === 1 ? 'verse' : 'verses'}
          </Text>
        </View>
      </SafeAreaView>
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {bookmarks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔖</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No bookmarks yet</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Tap the "Bookmark" button on any verse in the Library to save it here.
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
  container: { flex: 1 },
  header: { paddingTop: 12, paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  headerSubtitle: { fontSize: 14 },
  content: { flex: 1 },
  bookmarkCard: { marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 12 },
  bookmarkHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  bookmarkReference: { fontSize: 14, fontWeight: 'bold', flex: 1 },
  deleteButton: { padding: 4, marginLeft: 8 },
  deleteButtonText: { fontSize: 20 },
  bookmarkText: { fontSize: 16, lineHeight: 24, marginBottom: 8 },
  bookmarkDate: { fontSize: 12 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, marginTop: 120 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
});

export default BookmarksScreen;
