import * as SQLite from 'expo-sqlite';

let db = null;

const getDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('bible.db');
  }
  return db;
};

export const initDatabase = async () => {
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

  // Insert sample Bible books
  const books = [
    { id: 1, name: 'Genesis', testament: 'Old', chapters: 50 },
    { id: 2, name: 'Exodus', testament: 'Old', chapters: 40 },
    { id: 19, name: 'Psalms', testament: 'Old', chapters: 150 },
    { id: 20, name: 'Proverbs', testament: 'Old', chapters: 31 },
    { id: 23, name: 'Isaiah', testament: 'Old', chapters: 66 },
    { id: 40, name: 'Matthew', testament: 'New', chapters: 28 },
    { id: 41, name: 'Mark', testament: 'New', chapters: 16 },
    { id: 42, name: 'Luke', testament: 'New', chapters: 24 },
    { id: 43, name: 'John', testament: 'New', chapters: 21 },
    { id: 44, name: 'Acts', testament: 'New', chapters: 28 },
    { id: 45, name: 'Romans', testament: 'New', chapters: 16 },
    { id: 50, name: 'Philippians', testament: 'New', chapters: 4 },
    { id: 66, name: 'Revelation', testament: 'New', chapters: 22 },
  ];

  for (const book of books) {
    await database.runAsync(
      'INSERT OR IGNORE INTO books (id, name, testament, chapters) VALUES (?, ?, ?, ?);',
      [book.id, book.name, book.testament, book.chapters]
    );
  }

  // Insert sample verses
  const sampleVerses = [
    { book_id: 43, chapter: 3, verse: 16, text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
    { book_id: 19, chapter: 23, verse: 1, text: 'The Lord is my shepherd, I lack nothing.' },
    { book_id: 19, chapter: 23, verse: 4, text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.' },
    { book_id: 19, chapter: 46, verse: 1, text: 'God is our refuge and strength, an ever-present help in trouble.' },
    { book_id: 19, chapter: 27, verse: 1, text: 'The Lord is my light and my salvation—whom shall I fear? The Lord is the stronghold of my life—of whom shall I be afraid?' },
    { book_id: 23, chapter: 41, verse: 10, text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.' },
    { book_id: 40, chapter: 11, verse: 28, text: 'Come to me, all you who are weary and burdened, and I will give you rest.' },
    { book_id: 45, chapter: 8, verse: 28, text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
    { book_id: 45, chapter: 8, verse: 38, text: 'For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.' },
    { book_id: 50, chapter: 4, verse: 6, text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.' },
    { book_id: 50, chapter: 4, verse: 7, text: 'And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.' },
    { book_id: 50, chapter: 4, verse: 13, text: 'I can do all this through him who gives me strength.' },
    { book_id: 20, chapter: 3, verse: 5, text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
    { book_id: 19, chapter: 121, verse: 1, text: 'I lift up my eyes to the mountains—where does my help come from?' },
    { book_id: 19, chapter: 121, verse: 2, text: 'My help comes from the Lord, the Maker of heaven and earth.' },
    { book_id: 43, chapter: 14, verse: 27, text: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.' },
    { book_id: 43, chapter: 16, verse: 33, text: 'I have told you these things, so that in me you may have peace. In this world you will have trouble. But take heart! I have overcome the world.' },
    { book_id: 45, chapter: 15, verse: 13, text: 'May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.' },
  ];

  for (const verse of sampleVerses) {
    await database.runAsync(
      'INSERT OR IGNORE INTO verses (book_id, chapter, verse, text) VALUES (?, ?, ?, ?);',
      [verse.book_id, verse.chapter, verse.verse, verse.text]
    );
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
