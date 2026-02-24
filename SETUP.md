# Bible GPT - Quick Setup Guide

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (2 minutes)

```bash
# Navigate to project folder
cd bible-gpt

# Install all packages
npm install
```

### Step 2: Start the App (1 minute)

```bash
# Start Expo development server
npm start
```

This will open Expo DevTools in your browser with a QR code.

### Step 3: Run on Your Device (2 minutes)

**Option A: Physical Device**
1. Install "Expo Go" app from App Store (iOS) or Play Store (Android)
2. Scan the QR code from the terminal/browser
3. App will load on your device

**Option B: Simulator/Emulator**
- Press `i` in terminal for iOS Simulator (Mac only)
- Press `a` in terminal for Android Emulator

### Step 4: Configure AI (Optional)

The app works without configuration, but for the best AI responses:

1. Get a free API key:
   - **OpenAI**: https://platform.openai.com/signup (includes $5 free credits)
   - **Anthropic**: https://console.anthropic.com/

2. In the app:
   - Go to Settings tab (gear icon)
   - Tap "▶ Configure AI API"
   - Select provider (OpenAI or Claude)
   - Paste your API key
   - Tap "Save API Configuration"

**Without API Key**: The app uses smart fallback responses based on keywords.

**With API Key**: Get personalized, contextual responses with better verse recommendations.

## 📖 Adding More Bible Content

The app includes sample verses. For a complete Bible:

### Quick Method: Use Free APIs

Modify `src/services/aiService.js` to fetch verses from:
- https://bible-api.com/john+3:16
- https://api.esv.org/

### Complete Method: Local Database

1. Download Bible database:
   ```bash
   # SQLite format (recommended)
   wget https://raw.githubusercontent.com/scrollmapper/bible_databases/master/bible.db
   ```

2. Place in your project and update database initialization

## 🎨 First Use Tips

### Chat Interface
- Start simple: "I feel anxious"
- Be specific: "I'm worried about my job interview tomorrow"
- Ask for guidance: "What does the Bible say about forgiveness?"

### Library
- Browse by book or search keywords
- Tap any verse to bookmark it
- Bookmarks sync across app sessions

### Customization
- Toggle dark mode in Settings
- Adjust reading font size (S/M/L)
- Configure notification preferences (coming soon)

## 🔧 Common Issues

### "Module not found" error
```bash
npm install
expo start -c  # Clear cache
```

### App crashes on startup
Check that your Node.js version is 14+:
```bash
node --version
```

### SQLite errors
Make sure expo-sqlite is installed:
```bash
expo install expo-sqlite
```

### API not working
- Verify API key is correct
- Check you have credits (OpenAI)
- Try fallback mode first

## 📱 Features Overview

| Feature | Description | Requires API? |
|---------|-------------|---------------|
| Chat | AI companion for encouragement | Optional |
| Library | Browse Bible books/verses | No |
| Search | Find verses by keywords | No |
| Bookmarks | Save favorite verses | No |
| Dark Mode | Eye-friendly theme | No |
| Settings | Customize experience | No |

## 🎯 Next Steps

After setup:
1. ✅ Test the chat with "I need encouragement"
2. ✅ Browse a Bible book in Library
3. ✅ Bookmark a favorite verse
4. ✅ Try dark mode
5. ✅ Configure AI API (optional)

## 💡 Pro Tips

- The AI learns from conversation context
- Longer, more detailed questions = better responses
- Use bookmarks to build your personal verse collection
- Dark mode saves battery on OLED screens

## 🆘 Need Help?

1. Check README.md for detailed docs
2. Review code comments in source files
3. Most issues are fixed with `npm install` and restart

---

**You're ready to start!** 🎉

Open the app and try: *"I'm feeling lonely today"*
