# Bible GPT - Your Spiritual Companion

A beautiful, modern mobile app that provides spiritual guidance and encouragement through God's Word, powered by AI.

## ✨ Features

- **🤖 AI Companion Chat**: Share your struggles and receive comforting responses with relevant Bible verses
- **📚 Bible Library**: Browse books, chapters, and verses with a clean interface
- **🔍 Smart Search**: Find verses by keywords
- **🔖 Bookmarks**: Save your favorite verses
- **🌓 Dark Mode**: Easy on the eyes, day or night
- **💝 Fatherly Persona**: Warm, encouraging responses in a loving father's voice
- **📱 Modern UI/UX**: Beautiful, intuitive design with smooth animations

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator

### Installation

1. **Clone or download this project**

2. **Install dependencies**
```bash
cd bible-gpt
npm install
```

3. **Start the development server**
```bash
npm start
# or
expo start
```

4. **Run on your device**
   - Scan the QR code with the Expo Go app (iOS/Android)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator

## 🔑 API Configuration

Bible GPT works with or without an AI API key:

### Without API Key (Fallback Mode)
- The app will work with built-in fallback responses
- Basic encouragement and verse suggestions based on keywords
- No external API calls needed

### With API Key (Full AI Mode)
For the best experience, configure an AI API:

1. **Get an API Key**:
   - **OpenAI**: https://platform.openai.com/api-keys
   - **Anthropic (Claude)**: https://console.anthropic.com/

2. **Configure in App**:
   - Open Settings in the app
   - Tap "Configure AI API"
   - Select your provider (OpenAI or Claude)
   - Enter your API key
   - Tap "Save API Configuration"

**API Key Safety**:
- Keys are stored locally on your device only
- Never share your API keys
- Keys are hidden in the UI with secure text entry

## 📖 Bible Database

The app includes sample Bible verses. To get a complete Bible database:

### Option 1: Download a Complete Bible Database

1. Visit: https://github.com/scrollmapper/bible_databases
2. Download the SQLite database
3. Replace the database initialization in `src/services/database.js`

### Option 2: Use Bible API

You can modify the app to fetch verses from free APIs like:
- https://bible-api.com/
- https://api.scripture.api.bible/

## 🎨 Customization

### Change Colors
Edit `src/utils/theme.js` to customize:
- Primary color
- Background colors
- Text colors
- Button styles

### Modify AI Persona
Edit the `SYSTEM_PROMPT` in `src/services/aiService.js` to change:
- Tone and voice
- Response format
- Verse selection criteria

### Add Features
The app structure is modular and easy to extend:
- `/src/screens/` - Add new screens
- `/src/components/` - Add reusable components
- `/src/services/` - Add new services

## 📱 App Structure

```
bible-gpt/
├── App.js                      # Main app with navigation
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js       # Home dashboard
│   │   ├── ChatScreen.js       # AI chat interface
│   │   ├── LibraryScreen.js    # Bible browsing
│   │   ├── BookmarksScreen.js  # Saved verses
│   │   └── SettingsScreen.js   # App settings
│   ├── services/
│   │   ├── database.js         # SQLite operations
│   │   └── aiService.js        # AI API integration
│   └── utils/
│       └── theme.js            # Colors and styling
├── package.json
└── README.md
```

## 🛠 Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation
- **SQLite** - Local database
- **AsyncStorage** - Settings storage
- **OpenAI/Anthropic API** - AI responses

## 📋 Features Roadmap

Future enhancements:
- [ ] Daily verse notifications
- [ ] Reading plans
- [ ] Verse sharing with styled images
- [ ] Audio Bible
- [ ] Prayer journal
- [ ] Community features
- [ ] Multiple Bible translations
- [ ] Offline AI mode

## 🐛 Troubleshooting

### App won't start
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
expo start -c
```

### Database errors
- Check that `expo-sqlite` is properly installed
- Verify database initialization runs on first launch

### API not responding
- Verify your API key is correct
- Check your internet connection
- Ensure you have API credits (for paid providers)

## 📄 License

This project is open source and available for personal and educational use.

## 🙏 Acknowledgments

- Bible translations and texts
- React Native and Expo communities
- AI providers (OpenAI, Anthropic)

## 💬 Support

For questions or issues:
1. Check the troubleshooting section
2. Review the code comments
3. Open an issue on GitHub

---

Made with ❤️ for spiritual growth and encouragement

**"The Lord is my light and my salvation—whom shall I fear?" - Psalm 27:1**
