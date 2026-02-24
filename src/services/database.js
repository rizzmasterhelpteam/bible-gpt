import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('bible.db');

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Create books table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS books (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          testament TEXT NOT NULL,
          chapters INTEGER NOT NULL
        );`
      );

      // Create verses table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS verses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          book_id INTEGER NOT NULL,
          chapter INTEGER NOT NULL,
          verse INTEGER NOT NULL,
          text TEXT NOT NULL,
          FOREIGN KEY (book_id) REFERENCES books(id)
        );`
      );

      // Create bookmarks table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS bookmarks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          book_id INTEGER NOT NULL,
          chapter INTEGER NOT NULL,
          verse INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (book_id) REFERENCES books(id)
        );`
      );

      // Create chat history table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS chat_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
      );

      // Insert sample Bible books
      const books = [
        { id: 1, name: 'Genesis', testament: 'Old', chapters: 50 },
        { id: 2, name: 'Exodus', testament: 'Old', chapters: 40 },
        { id: 19, name: 'Psalms', testament: 'Old', chapters: 150 },
        { id: 23, name: 'Isaiah', testament: 'Old', chapters: 66 },
        { id: 40, name: 'Matthew', testament: 'New', chapters: 28 },
        { id: 41, name: 'Mark', testament: 'New', chapters: 16 },
        { id: 42, name: 'Luke', testament: 'New', chapters: 24 },
        { id: 43, name: 'John', testament: 'New', chapters: 21 },
        { id: 44, name: 'Acts', testament: 'New', chapters: 28 },
        { id: 45, name: 'Romans', testament: 'New', chapters: 16 },
        { id: 66, name: 'Revelation', testament: 'New', chapters: 22 }
      ];

      books.forEach(book => {
        tx.executeSql(
          'INSERT OR IGNORE INTO books (id, name, testament, chapters) VALUES (?, ?, ?, ?);',
          [book.id, book.name, book.testament, book.chapters]
        );
      });

      // Insert sample verses for demonstration
      const sampleVerses = [
        { book_id: 43, chapter: 3, verse: 16, text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
        { book_id: 19, chapter: 23, verse: 1, text: 'The Lord is my shepherd, I lack nothing.' },
        { book_id: 19, chapter: 23, verse: 4, text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.' },
        { book_id: 19, chapter: 46, verse: 1, text: 'God is our refuge and strength, an ever-present help in trouble.' },
        { book_id: 23, chapter: 41, verse: 10, text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.' },
        { book_id: 40, chapter: 11, verse: 28, text: 'Come to me, all you who are weary and burdened, and I will give you rest.' },
        { book_id: 45, chapter: 8, verse: 28, text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
        { book_id: 45, chapter: 8, verse: 38, text: 'For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.' }
      ];

      sampleVerses.forEach(verse => {
        tx.executeSql(
          'INSERT OR IGNORE INTO verses (book_id, chapter, verse, text) VALUES (?, ?, ?, ?);',
          [verse.book_id, verse.chapter, verse.verse, verse.text]
        );
      });
    }, 
    error => reject(error),
    () => resolve(true));
  });
};

export const getBooks = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM books ORDER BY id;',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getChapter = (bookId, chapter) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM verses WHERE book_id = ? AND chapter = ? ORDER BY verse;',
        [bookId, chapter],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const searchVerses = (keyword) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT v.*, b.name as book_name 
         FROM verses v 
         JOIN books b ON v.book_id = b.id 
         WHERE v.text LIKE ? 
         LIMIT 50;`,
        [`%${keyword}%`],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const addBookmark = (bookId, chapter, verse) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO bookmarks (book_id, chapter, verse) VALUES (?, ?, ?);',
        [bookId, chapter, verse],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getBookmarks = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT b.*, bk.name as book_name, v.text 
         FROM bookmarks b 
         JOIN books bk ON b.book_id = bk.id 
         JOIN verses v ON b.book_id = v.book_id AND b.chapter = v.chapter AND b.verse = v.verse 
         ORDER BY b.created_at DESC;`,
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const saveChatMessage = (role, content) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO chat_history (role, content) VALUES (?, ?);',
        [role, content],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getChatHistory = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM chat_history ORDER BY created_at ASC;',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const clearChatHistory = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM chat_history;',
        [],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export default db;
