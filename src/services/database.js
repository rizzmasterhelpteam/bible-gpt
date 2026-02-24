import * as SQLite from 'expo-sqlite';
import { KJV_BIBLE } from '../data/bibleData';

// Full book name → canonical ID mapping (39 OT + 27 NT = 66 books)
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

const TESTAMENT_MAP = {
  1: "Old", 2: "Old", 3: "Old", 4: "Old", 5: "Old", 6: "Old", 7: "Old", 8: "Old",
  9: "Old", 10: "Old", 11: "Old", 12: "Old", 13: "Old", 14: "Old", 15: "Old",
  16: "Old", 17: "Old", 18: "Old", 19: "Old", 20: "Old", 21: "Old", 22: "Old",
  23: "Old", 24: "Old", 25: "Old", 26: "Old", 27: "Old", 28: "Old", 29: "Old",
  30: "Old", 31: "Old", 32: "Old", 33: "Old", 34: "Old", 35: "Old", 36: "Old",
  37: "Old", 38: "Old", 39: "Old",
  40: "New", 41: "New", 42: "New", 43: "New", 44: "New", 45: "New", 46: "New",
  47: "New", 48: "New", 49: "New", 50: "New", 51: "New", 52: "New", 53: "New",
  54: "New", 55: "New", 56: "New", 57: "New", 58: "New", 59: "New", 60: "New",
  61: "New", 62: "New", 63: "New", 64: "New", 65: "New", 66: "New",
};

let db = null;
let initialized = false;

const getDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('bible_kjv.db');
  }
  return db;
};

export const initDatabase = async () => {
  if (initialized) return true;

  const database = await getDB();

  await database.execAsync(`
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
      UNIQUE(book_id, chapter, verse),
      FOREIGN KEY (book_id) REFERENCES books(id)
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(book_id, chapter, verse),
      FOREIGN KEY (book_id) REFERENCES books(id)
    );

    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Check if the Bible data is already loaded
  const bookCount = await database.getFirstAsync('SELECT COUNT(*) as count FROM books;');
  if (bookCount.count >= 66) {
    initialized = true;
    return true;
  }

  // Seed all 66 books from the bundled KJV data
  console.log('Seeding KJV Bible data...');
  for (const bookData of KJV_BIBLE) {
    const bookName = bookData.book;
    const bookId = BOOK_ID_MAP[bookName];
    if (!bookId) continue;

    const testament = TESTAMENT_MAP[bookId] || 'Old';
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
  }

  console.log('Bible seeding complete!');
  initialized = true;
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
     FROM verses v
     JOIN books b ON v.book_id = b.id
     WHERE v.text LIKE ?
     LIMIT 50;`,
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
  return await database.getAllAsync(
    'SELECT * FROM chat_history ORDER BY created_at ASC;'
  );
};

export const clearChatHistory = async () => {
  const database = await getDB();
  return await database.runAsync('DELETE FROM chat_history;');
};

export default { getDB };
