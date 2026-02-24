#!/bin/bash

echo "🙏 Bible GPT - Quick Start Script"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "📥 Please install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the app, run:"
echo "  npm start"
echo ""
echo "Then:"
echo "  - Press 'i' for iOS simulator"
echo "  - Press 'a' for Android emulator"
echo "  - Scan QR code with Expo Go app on your phone"
echo ""
echo "📖 For more info, read:"
echo "  - README.md (full documentation)"
echo "  - SETUP.md (quick setup guide)"
echo "  - API_GUIDE.md (API configuration)"
echo ""
echo "Happy building! 🚀"
