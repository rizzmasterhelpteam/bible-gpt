import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { getTheme } from '../utils/theme';
import { getBooks, getChapter, searchVerses, addBookmark } from '../services/database';

const LibraryScreen = ({ isDark = false }) => {
  const theme = getTheme(isDark);
  const [activeTab, setActiveTab] = useState('books'); // 'books' or 'search'
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [verses, setVerses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const booksData = await getBooks();
      setBooks(booksData);
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setSelectedChapter(null);
    setVerses([]);
  };

  const handleChapterSelect = async (chapterNum) => {
    setSelectedChapter(chapterNum);
    setIsLoading(true);
    try {
      const chapterVerses = await getChapter(selectedBook.id, chapterNum);
      setVerses(chapterVerses);
    } catch (error) {
      console.error('Error loading chapter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const results = await searchVerses(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmark = async (verse) => {
    try {
      await addBookmark(verse.book_id, verse.chapter, verse.verse);
      alert('Verse bookmarked! ✨');
    } catch (error) {
      console.error('Error bookmarking:', error);
    }
  };

  const BookCard = ({ book }) => (
    <TouchableOpacity
      style={[styles.bookCard, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}
      onPress={() => handleBookSelect(book)}
      activeOpacity={0.7}
    >
      <View style={[styles.bookIcon, { backgroundColor: theme.colors.primary + '20' }]}>
        <Text style={styles.bookIconText}>📖</Text>
      </View>
      <Text style={[styles.bookName, { color: theme.colors.text }]}>{book.name}</Text>
      <Text style={[styles.bookInfo, { color: theme.colors.textSecondary }]}>
        {book.chapters} chapters
      </Text>
    </TouchableOpacity>
  );

  const VerseCard = ({ verse, showBookInfo = false }) => (
    <View style={[styles.verseCard, { backgroundColor: theme.colors.verseBg }]}>
      {showBookInfo && (
        <Text style={[styles.verseReference, { color: theme.colors.primary }]}>
          {verse.book_name} {verse.chapter}:{verse.verse}
        </Text>
      )}
      {!showBookInfo && (
        <Text style={[styles.verseNumber, { color: theme.colors.primary }]}>
          {verse.verse}
        </Text>
      )}
      <Text style={[styles.verseTextDisplay, { color: theme.colors.text }]}>
        {verse.text}
      </Text>
      <TouchableOpacity
        style={[styles.bookmarkButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => handleBookmark(verse)}
      >
        <Text style={styles.bookmarkButtonText}>🔖 Bookmark</Text>
      </TouchableOpacity>
    </View>
  );

  // Render Books List
  if (activeTab === 'books' && !selectedBook) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Bible Library</Text>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, { backgroundColor: theme.colors.primary }]}
              onPress={() => setActiveTab('books')}
            >
              <Text style={styles.tabTextActive}>Books</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, { backgroundColor: theme.colors.border }]}
              onPress={() => setActiveTab('search')}
            >
              <Text style={[styles.tabText, { color: theme.colors.text }]}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.booksGrid}>
          {books.map(book => <BookCard key={book.id} book={book} />)}
        </ScrollView>
      </View>
    );
  }

  // Render Chapter Selection
  if (activeTab === 'books' && selectedBook && !selectedChapter) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity onPress={() => setSelectedBook(null)} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{selectedBook.name}</Text>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.chaptersGrid}>
          {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(chapterNum => (
            <TouchableOpacity
              key={chapterNum}
              style={[styles.chapterButton, { backgroundColor: theme.colors.surface }, theme.shadows.sm]}
              onPress={() => handleChapterSelect(chapterNum)}
            >
              <Text style={[styles.chapterText, { color: theme.colors.text }]}>
                Chapter {chapterNum}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Render Verses
  if (activeTab === 'books' && selectedChapter) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity onPress={() => setSelectedChapter(null)} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {selectedBook.name} {selectedChapter}
          </Text>
        </View>
        <ScrollView style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            verses.map(verse => <VerseCard key={verse.id} verse={verse} />)
          )}
        </ScrollView>
      </View>
    );
  }

  // Render Search Tab
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Bible Library</Text>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, { backgroundColor: theme.colors.border }]}
            onPress={() => setActiveTab('books')}
          >
            <Text style={[styles.tabText, { color: theme.colors.text }]}>Books</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, { backgroundColor: theme.colors.primary }]}
            onPress={() => setActiveTab('search')}
          >
            <Text style={styles.tabTextActive}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
          placeholder="Search for verses..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: theme.colors.accent }]}
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : searchResults.length > 0 ? (
          searchResults.map((verse, index) => <VerseCard key={index} verse={verse} showBookInfo />)
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon]}>🔍</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {searchQuery ? 'No verses found' : 'Search for keywords in Scripture'}
            </Text>
          </View>
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
    marginBottom: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  booksGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bookCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  bookIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookIconText: {
    fontSize: 24,
  },
  bookName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  bookInfo: {
    fontSize: 12,
  },
  chaptersGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chapterButton: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  chapterText: {
    fontSize: 16,
    fontWeight: '600',
  },
  verseCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  verseNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  verseReference: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  verseTextDisplay: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  bookmarkButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bookmarkButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
  },
  searchButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LibraryScreen;
