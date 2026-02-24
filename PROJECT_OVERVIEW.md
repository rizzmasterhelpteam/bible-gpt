# Bible GPT - Project Overview

## 📁 Complete Project Structure

```
bible-gpt/
├── 📄 App.js                       # Main application entry with navigation
├── 📄 index.js                     # Expo entry point
├── 📄 package.json                 # Dependencies and scripts
├── 📄 app.json                     # Expo configuration
├── 📄 babel.config.js              # Babel transpiler config
├── 📄 .gitignore                   # Git ignore rules
│
├── 📖 README.md                    # Complete documentation
├── 📖 SETUP.md                     # Quick start guide
├── 📖 API_GUIDE.md                 # API integration guide
│
├── 📂 src/
│   ├── 📂 screens/                 # All app screens
│   │   ├── HomeScreen.js           # 🏠 Home dashboard with daily verse
│   │   ├── ChatScreen.js           # 💬 AI chat interface
│   │   ├── LibraryScreen.js        # 📚 Bible browsing & search
│   │   ├── BookmarksScreen.js      # 🔖 Saved verses
│   │   └── SettingsScreen.js       # ⚙️ App configuration
│   │
│   ├── 📂 services/                # Backend services
│   │   ├── database.js             # SQLite operations
│   │   └── aiService.js            # AI API integration
│   │
│   ├── 📂 utils/                   # Utility functions
│   │   └── theme.js                # Colors & styling
│   │
│   ├── 📂 components/              # Reusable components (create as needed)
│   └── 📂 data/                    # Static data (create as needed)
│
└── 📂 assets/                      # Images, fonts, icons (create as needed)
```

## 🎯 Core Features

### 1. Home Screen (HomeScreen.js)
**Purpose**: Welcome dashboard with quick access

**Features**:
- Daily verse display
- Quick action cards (Chat, Library, Bookmarks, Settings)
- Inspiring quotes
- Beautiful gradient design

**Key Functions**:
- `loadDailyVerse()` - Fetches random encouraging verse
- Navigation to other screens

### 2. Chat Screen (ChatScreen.js)
**Purpose**: AI-powered spiritual companion

**Features**:
- WhatsApp-style chat bubbles
- User/AI message distinction
- Chat history persistence
- Loading indicators
- Suggested prompts for new users
- Scroll to bottom on new messages

**Key Functions**:
- `handleSend()` - Sends message and gets AI response
- `loadChatHistory()` - Loads previous conversations
- `handleClearHistory()` - Clears all messages

**AI Integration**:
- Calls `getAIResponse()` from aiService.js
- Falls back to keyword-based responses
- Saves all messages to SQLite

### 3. Library Screen (LibraryScreen.js)
**Purpose**: Browse and search Bible content

**Features**:
- Books grid view
- Chapter selection
- Verse display with bookmarking
- Search by keywords
- Two-tab interface (Books/Search)

**Key Functions**:
- `handleBookSelect()` - Navigates to chapter selection
- `handleChapterSelect()` - Loads verses for chapter
- `handleSearch()` - Searches verses by keyword
- `handleBookmark()` - Saves verse to bookmarks

**Navigation Flow**:
1. Books List → 2. Chapters List → 3. Verses Display

### 4. Bookmarks Screen (BookmarksScreen.js)
**Purpose**: Manage saved verses

**Features**:
- List of bookmarked verses
- Pull-to-refresh
- Verse cards with full text
- Timestamp of when saved

**Key Functions**:
- `loadBookmarks()` - Fetches all bookmarks
- `onRefresh()` - Refreshes bookmark list

### 5. Settings Screen (SettingsScreen.js)
**Purpose**: App configuration and customization

**Features**:
- Dark mode toggle
- Font size adjustment (S/M/L)
- AI API configuration
- Provider selection (OpenAI/Claude)
- API key management
- App information

**Key Functions**:
- `handleSaveApiKey()` - Saves API configuration
- `handleFontSizeChange()` - Updates reading font size
- `toggleTheme()` - Switches between light/dark themes

## 🗄️ Database Schema

### Tables:

**books**
```sql
- id: INTEGER PRIMARY KEY
- name: TEXT (e.g., "Genesis", "John")
- testament: TEXT ("Old" or "New")
- chapters: INTEGER (number of chapters)
```

**verses**
```sql
- id: INTEGER PRIMARY KEY
- book_id: INTEGER (foreign key to books)
- chapter: INTEGER
- verse: INTEGER
- text: TEXT (verse content)
```

**bookmarks**
```sql
- id: INTEGER PRIMARY KEY
- book_id: INTEGER
- chapter: INTEGER
- verse: INTEGER
- created_at: DATETIME
```

**chat_history**
```sql
- id: INTEGER PRIMARY KEY
- role: TEXT ("user" or "assistant")
- content: TEXT (message content)
- created_at: DATETIME
```

## 🤖 AI Service Architecture

**File**: `src/services/aiService.js`

**Supported Providers**:
1. OpenAI (GPT-3.5-turbo, GPT-4)
2. Anthropic (Claude)
3. Fallback (Local keyword matching)

**Response Flow**:
```
User Message
    ↓
getAIResponse()
    ↓
Check if API key configured
    ↓
Yes: Call API (OpenAI/Claude)
    ↓
No: Use fallback response
    ↓
Return formatted response with verses
```

**Fallback Response Logic**:
- Detects keywords: lonely, fear, anxious, worried, sad, etc.
- Searches database for relevant verses
- Returns pre-written encouraging message + verses
- Works 100% offline

## 🎨 Theming System

**File**: `src/utils/theme.js`

**Light Theme**:
- Primary: Warm gold (#D4A574)
- Background: White (#FFFFFF)
- Surface: Cream (#F9F7F4)
- Text: Dark charcoal (#2C3E50)

**Dark Theme**:
- Primary: Warm gold (#D4A574)
- Background: Dark (#1A1A1A)
- Surface: Navy (#2C3E50)
- Text: Cream (#F9F7F4)

**Usage**:
```javascript
const theme = getTheme(isDark);
// Access colors: theme.colors.primary
```

## 📱 Navigation Structure

**Bottom Tab Navigator**:
1. 🏠 Home
2. 💬 Chat
3. 📚 Library
4. 🔖 Bookmarks
5. ⚙️ Settings

**Navigation Props Passed**:
- `isDark` - Current theme mode
- `onThemeToggle` - Function to toggle theme (Settings only)

## 💾 Data Persistence

**AsyncStorage** (Key-Value pairs):
- `theme` - "light" or "dark"
- `ai_api_key` - Encrypted API key
- `ai_provider` - "openai" or "anthropic"
- `font_size` - "small", "medium", "large"

**SQLite** (Relational database):
- Books and verses
- Bookmarks
- Chat history

## 🔄 State Management

**Local State** (useState):
- Screen-specific UI state
- Form inputs
- Loading states

**Persistent State** (AsyncStorage + SQLite):
- User preferences
- Chat history
- Bookmarks

**Global State** (Props):
- Theme mode (isDark)
- Passed through navigation

## 🚀 Performance Optimizations

1. **Lazy Loading**: Verses loaded on-demand per chapter
2. **Pagination**: Search results limited to 50
3. **Caching**: Theme preference cached locally
4. **Optimistic UI**: Messages appear before API response
5. **Debouncing**: Search triggers on submit, not per keystroke

## 🧪 Testing Guide

**Manual Testing Checklist**:

Home Screen:
- [ ] Daily verse loads
- [ ] Quick action cards navigate correctly
- [ ] Refresh updates daily verse

Chat Screen:
- [ ] Messages send and receive
- [ ] Chat history persists
- [ ] Fallback responses work without API
- [ ] Loading indicator shows
- [ ] Clear history works

Library Screen:
- [ ] Books list displays
- [ ] Chapter selection works
- [ ] Verses display correctly
- [ ] Search finds verses
- [ ] Bookmarking works

Bookmarks Screen:
- [ ] Bookmarks load
- [ ] Pull-to-refresh works
- [ ] Empty state shows correctly

Settings Screen:
- [ ] Dark mode toggles
- [ ] Font size changes
- [ ] API configuration saves
- [ ] Theme persists on restart

## 📦 Deployment Checklist

Before publishing:

1. **Code Quality**:
   - [ ] Remove console.logs
   - [ ] Add error boundaries
   - [ ] Optimize images
   - [ ] Test on multiple devices

2. **Database**:
   - [ ] Add complete Bible database
   - [ ] Test migrations
   - [ ] Verify indexes

3. **API**:
   - [ ] Implement backend proxy (recommended)
   - [ ] Add rate limiting
   - [ ] Set up monitoring

4. **Assets**:
   - [ ] Create app icon
   - [ ] Create splash screen
   - [ ] Add placeholder images

5. **Legal**:
   - [ ] Add privacy policy
   - [ ] Add terms of service
   - [ ] Include Bible translation credits

## 🔮 Future Enhancements

**Priority 1** (High Impact):
- Push notifications for daily verses
- Share verses as styled images
- Multiple Bible translations

**Priority 2** (Medium Impact):
- Reading plans (30-day, topical)
- Prayer journal
- Verse of the day widget

**Priority 3** (Nice to Have):
- Audio Bible
- Community features
- Cross-references
- Study notes

## 🛠 Common Customizations

### Change App Name:
1. Edit `app.json`: "name" and "slug"
2. Edit `package.json`: "name"

### Change Colors:
1. Edit `src/utils/theme.js`
2. Update `colors.light` and `colors.dark`

### Add New Screen:
1. Create `NewScreen.js` in `src/screens/`
2. Add to navigation in `App.js`
3. Add tab icon and label

### Modify AI Persona:
1. Edit `SYSTEM_PROMPT` in `src/services/aiService.js`
2. Adjust tone, format, verse selection

### Add Bible Translation:
1. Update database schema
2. Add translation selector in Settings
3. Modify verse queries to filter by translation

---

## 🎓 Learning Resources

**React Native**:
- https://reactnative.dev/docs/getting-started
- https://react.dev/learn

**Expo**:
- https://docs.expo.dev/

**SQLite**:
- https://github.com/expo/expo/tree/main/packages/expo-sqlite

**Navigation**:
- https://reactnavigation.org/docs/getting-started

---

**Happy Building! 🙏✨**

Questions? Check README.md, SETUP.md, or API_GUIDE.md
