import * as SQLite from 'expo-sqlite';
import { KJV_BIBLE } from '../data/bibleData';

// ─────────────────────────────────────────────
// Bible data served DIRECTLY from bundled JSON
// No SQLite seeding needed – instant startup!
// ─────────────────────────────────────────────

const BOOK_ID_MAP = {
  "Genesis": 1, "Exodus": 2, "Leviticus": 3, "Numbers": 4, "Deuteronomy": 5,
  "Joshua": 6, "Judges": 7, "Ruth": 8, "1 Samuel": 9, "2 Samuel": 10,
  "1 Kings": 11, "2 Kings": 12, "1 Chronicles": 13, "2 Chronicles": 14,
  "Ezra": 15, "Nehemiah": 16, "Esther": 17, "Job": 18, "Psalms": 19,
  "Proverbs": 20, "Ecclesiastes": 21, "Song of Solomon": 22, "Isaiah": 23,
  "Jeremiah": 24, "Lamentations": 25, "Ezekiel": 26, "Daniel": 27,
  "Hosea": 28, "Joel": 29, "Amos": 30, "Obadiah": 31, "Jonah": 32,
  "Micah": 33, "Nahum": 34, "Habakkuk": 35, "Zephaniah": 36, "Haggai": 37,
  "Zechariah": 38, "Malachi": 39, "Matthew": 40, "Mark": 41, "Luke": 42,
  "John": 43, "Acts": 44, "Romans": 45, "1 Corinthians": 46, "2 Corinthians": 47,
  "Galatians": 48, "Ephesians": 49, "Philippians": 50, "Colossians": 51,
  "1 Thessalonians": 52, "2 Thessalonians": 53, "1 Timothy": 54, "2 Timothy": 55,
  "Titus": 56, "Philemon": 57, "Hebrews": 58, "James": 59, "1 Peter": 60,
  "2 Peter": 61, "1 John": 62, "2 John": 63, "3 John": 64, "Jude": 65,
  "Revelation": 66,
};

// Build a lookup: bookId → bookData (done once on module load)
const BOOK_MAP = {};
for (const bookData of KJV_BIBLE) {
  const id = BOOK_ID_MAP[bookData.book];
  if (id) BOOK_MAP[id] = bookData;
}

const TESTAMENT = (id) => id <= 39 ? 'Old' : 'New';

// ─────────────────────────────────────────────
// Search Index – pre-computed for performance
// ─────────────────────────────────────────────

const SEARCH_INDEX = [];
const buildSearchIndex = () => {
  if (SEARCH_INDEX.length > 0) return;
  for (const bookData of KJV_BIBLE) {
    const bookId = BOOK_ID_MAP[bookData.book];
    if (!bookId) continue;
    for (const chapterData of bookData.chapters) {
      const chapterNum = parseInt(chapterData.chapter, 10);
      for (const verseData of chapterData.verses) {
        SEARCH_INDEX.push({
          book_id: bookId,
          book_name: bookData.book,
          chapter: chapterNum,
          verse: parseInt(verseData.verse, 10),
          text: verseData.text,
          lowerText: verseData.text.toLowerCase()
        });
      }
    }
  }
};

// ─────────────────────────────────────────────
// Bible query functions (pure JavaScript, instant)
// ─────────────────────────────────────────────

export const getBooks = async () => {
  return KJV_BIBLE
    .map((bookData) => {
      const id = BOOK_ID_MAP[bookData.book];
      if (!id) return null;
      return {
        id,
        name: bookData.book,
        testament: TESTAMENT(id),
        chapters: bookData.chapters.length,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.id - b.id);
};

export const getChapter = async (bookId, chapter) => {
  const bookData = BOOK_MAP[bookId];
  if (!bookData) return [];
  const chapterData = bookData.chapters.find(c => parseInt(c.chapter, 10) === chapter);
  if (!chapterData) return [];
  return chapterData.verses.map((v) => ({
    book_id: bookId,
    book_name: bookData.book,
    chapter,
    verse: parseInt(v.verse, 10),
    text: v.text,
  }));
};

export const searchVerses = async (keyword) => {
  if (!keyword || keyword.trim().length < 2) return [];
  buildSearchIndex();

  const lower = keyword.toLowerCase();
  const results = [];

  for (const item of SEARCH_INDEX) {
    if (item.lowerText.includes(lower)) {
      results.push({
        book_id: item.book_id,
        book_name: item.book_name,
        chapter: item.chapter,
        verse: item.verse,
        text: item.text
      });
      if (results.length >= 50) break;
    }
  }

  return results;
};

// ─────────────────────────────────────────────
// SQLite – only used for Bookmarks & Chat History
// ─────────────────────────────────────────────

let db = null;

const getDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('bible_app.db');
  }
  return db;
};

export const initDatabase = async () => {
  const database = await getDB();
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(book_id, chapter, verse)
    );
    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  return true;
};

export const addBookmark = async (bookId, chapter, verse) => {
  const database = await getDB();
  return await database.runAsync(
    'INSERT OR IGNORE INTO bookmarks (book_id, chapter, verse) VALUES (?, ?, ?);',
    [bookId, chapter, verse]
  );
};

export const deleteBookmark = async (id) => {
  const database = await getDB();
  return await database.runAsync('DELETE FROM bookmarks WHERE id = ?;', [id]);
};

export const getBookmarks = async () => {
  const database = await getDB();
  const rows = await database.getAllAsync(
    'SELECT * FROM bookmarks ORDER BY created_at DESC;'
  );
  // Enrich with verse text from bundled data
  return rows.map((row) => {
    const bookData = BOOK_MAP[row.book_id];
    const bookName = bookData ? bookData.book : 'Unknown';
    let text = '';
    if (bookData) {
      const chapterData = bookData.chapters.find(c => parseInt(c.chapter, 10) === row.chapter);
      if (chapterData) {
        const verseData = chapterData.verses.find(v => parseInt(v.verse, 10) === row.verse);
        if (verseData) text = verseData.text;
      }
    }
    return { ...row, book_name: bookName, text };
  });
};

export const saveChatMessage = async (role, content) => {
  const database = await getDB();
  return await database.runAsync(
    'INSERT INTO chat_history (role, content) VALUES (?, ?);',
    [role, content]
  );
};

export const getChatHistory = async () => {
  const database = await getDB();
  return await database.getAllAsync('SELECT * FROM chat_history ORDER BY created_at ASC;');
};

export const clearChatHistory = async () => {
  const database = await getDB();
  return await database.runAsync('DELETE FROM chat_history;');
};

export default { getDB };
