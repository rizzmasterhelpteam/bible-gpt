import * as SQLite from 'expo-sqlite';
import { KJV_BIBLE } from '../data/bibleData';

// Book name → ID mapping (matches the 'book' field inside the downloaded JSON)
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

const TESTAMENT_MAP = (id) => id <= 39 ? 'Old' : 'New';

let db = null;

const getDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('bible_kjv2.db');
  }
  return db;
};

/**
 * Initialize database schema and seed KJV data.
 * @param {Function} onProgress - called with (bookIndex, totalBooks) during seeding
 */
export const initDatabase = async (onProgress) => {
  const database = await getDB();

  // Create tables
  await database.execAsync(`
    PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      testament TEXT NOT NULL,
      chapters INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      text TEXT NOT NULL,
      UNIQUE(book_id, chapter, verse)
    );
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
    CREATE INDEX IF NOT EXISTS idx_verses_book ON verses(book_id, chapter, verse);
  `);

  // Check if already seeded
  const bookCount = await database.getFirstAsync('SELECT COUNT(*) as count FROM books;');
  if (bookCount.count >= 66) return true;

  // Seed inside a single transaction for speed (100x faster than individual inserts)
  await database.execAsync('BEGIN TRANSACTION;');
  try {
    const total = KJV_BIBLE.length;
    for (let i = 0; i < total; i++) {
      const bookData = KJV_BIBLE[i];
      const bookName = bookData.book;
      const bookId = BOOK_ID_MAP[bookName];
      if (!bookId) {
        console.warn('Unknown book:', bookName);
        continue;
      }

      const testament = TESTAMENT_MAP(bookId);
      const chapterCount = bookData.chapters.length;

      await database.runAsync(
        'INSERT OR IGNORE INTO books (id, name, testament, chapters) VALUES (?, ?, ?, ?);',
        [bookId, bookName, testament, chapterCount]
      );

      for (const chapterData of bookData.chapters) {
        const chapterNum = parseInt(chapterData.chapter, 10);
        for (const verseData of chapterData.verses) {
          const verseNum = parseInt(verseData.verse, 10);
          await database.runAsync(
            'INSERT OR IGNORE INTO verses (book_id, chapter, verse, text) VALUES (?, ?, ?, ?);',
            [bookId, chapterNum, verseNum, verseData.text]
          );
        }
      }

      if (onProgress) onProgress(i + 1, total);
    }
    await database.execAsync('COMMIT;');
    console.log('Bible seeding complete!');
  } catch (error) {
    await database.execAsync('ROLLBACK;');
    console.error('Seeding error:', error);
    throw error;
  }

  return true;
};

export const getBooks = async () => {
  const database = await getDB();
  return await database.getAllAsync('SELECT * FROM books ORDER BY id;');
};

export const getChapter = async (bookId, chapter) => {
  const database = await getDB();
  return await database.getAllAsync(
    'SELECT * FROM verses WHERE book_id = ? AND chapter = ? ORDER BY verse;',
    [bookId, chapter]
  );
};

export const searchVerses = async (keyword) => {
  const database = await getDB();
  return await database.getAllAsync(
    `SELECT v.*, b.name as book_name
     FROM verses v JOIN books b ON v.book_id = b.id
     WHERE v.text LIKE ? LIMIT 50;`,
    [`%${keyword}%`]
  );
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
  return await database.getAllAsync(
    `SELECT b.*, bk.name as book_name, v.text
     FROM bookmarks b
     JOIN books bk ON b.book_id = bk.id
     JOIN verses v ON b.book_id = v.book_id AND b.chapter = v.chapter AND b.verse = v.verse
     ORDER BY b.created_at DESC;`
  );
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
