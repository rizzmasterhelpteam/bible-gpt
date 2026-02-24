# Bible GPT - API Integration Guide

This guide explains how to integrate free AI APIs with Bible GPT.

## 🆓 Free API Options

### 1. OpenAI (Recommended for Beginners)

**Free Tier**: $5 in free credits for new accounts

**Setup Steps**:

1. **Sign up**: https://platform.openai.com/signup
2. **Get API key**: https://platform.openai.com/api-keys
3. **Create new key**: Click "Create new secret key"
4. **Copy key**: Starts with `sk-...`

**Costs** (after free credits):
- GPT-3.5-turbo: $0.0005 per 1K tokens (~$0.001 per conversation)
- Very affordable for personal use

**In the app**:
- Settings → Configure AI API
- Provider: OpenAI
- Paste your key
- Save

### 2. Anthropic Claude

**Free Tier**: Limited free credits for testing

**Setup Steps**:

1. **Sign up**: https://console.anthropic.com/
2. **Get API key**: Dashboard → API Keys
3. **Create key**: Click "Create Key"
4. **Copy key**: Starts with `sk-ant-...`

**In the app**:
- Settings → Configure AI API
- Provider: Claude
- Paste your key
- Save

### 3. Free Alternative: Hugging Face

**Completely Free** (with rate limits)

**Setup**: Modify `src/services/aiService.js`

```javascript
// Add this function to aiService.js

const getHuggingFaceResponse = async (userMessage) => {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        inputs: `${SYSTEM_PROMPT}\n\nUser: ${userMessage}\n\nAssistant:`,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.7,
        }
      },
      {
        headers: {
          'Authorization': 'Bearer YOUR_HF_TOKEN_HERE',
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data[0].generated_text.split('Assistant:')[1].trim();
  } catch (error) {
    console.error('Hugging Face API Error:', error);
    throw error;
  }
};
```

Get your token: https://huggingface.co/settings/tokens

## 🔒 API Key Security

### ✅ DO:
- Store keys in app settings (AsyncStorage)
- Use secure text input in UI
- Keep keys private
- Use environment variables for development

### ❌ DON'T:
- Commit keys to GitHub
- Share keys publicly
- Use production keys in public apps
- Store keys in plain text files

## 💰 Cost Management

### OpenAI Tips:
1. Set usage limits in OpenAI dashboard
2. Use GPT-3.5-turbo (much cheaper than GPT-4)
3. Keep responses concise (set max_tokens: 500)
4. Monitor usage: https://platform.openai.com/usage

### Typical Costs:
- 1 conversation (3-5 messages): ~$0.001-0.002
- 100 conversations: ~$0.10-0.20
- 1000 conversations: ~$1-2

Very affordable for personal use!

## 🧪 Testing Without API Key

The app includes smart fallback responses:

```javascript
// Automatically triggered when no API key is configured
// Uses keyword matching + local verse database
// Works offline
```

**Fallback Features**:
- Keyword detection (lonely, fear, anxious, etc.)
- Relevant verse suggestions
- Encouraging responses
- No API costs

## 🔄 Switching Providers

You can switch between providers anytime:

1. Settings → Configure AI API
2. Select new provider
3. Enter new API key
4. Save

Previous conversations remain in history.

## 📊 Response Quality Comparison

| Provider | Quality | Speed | Cost | Best For |
|----------|---------|-------|------|----------|
| GPT-3.5 | Good | Fast | Low | General use |
| GPT-4 | Excellent | Slower | High | Complex queries |
| Claude | Excellent | Fast | Medium | Thoughtful responses |
| Fallback | Basic | Instant | Free | Offline/testing |

## 🛠 Advanced: Custom API

To use a custom API endpoint:

```javascript
// In src/services/aiService.js

const getCustomAPIResponse = async (userMessage) => {
  try {
    const response = await axios.post(
      'YOUR_API_ENDPOINT',
      {
        message: userMessage,
        system: SYSTEM_PROMPT
      },
      {
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN',
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.response;
  } catch (error) {
    console.error('Custom API Error:', error);
    throw error;
  }
};
```

## 🐛 Troubleshooting API Issues

### "Invalid API Key" Error
- Double-check the key is copied correctly
- Ensure no extra spaces
- Verify key hasn't expired
- Check you're using the right provider

### "Rate Limit" Error
- Wait a few seconds and retry
- You've exceeded free tier limits
- Upgrade your plan or wait for reset

### No Response
- Check internet connection
- Verify API key is configured
- Check API provider status page
- Review API credits/quota

### Slow Responses
- Normal for GPT-4 (15-30 seconds)
- Check your internet speed
- Try GPT-3.5 for faster responses

## 📱 Production Deployment

For a public app, implement:

1. **Backend Proxy**:
   - Don't expose API keys in mobile app
   - Create backend service to handle AI calls
   - Mobile app calls your backend

2. **Rate Limiting**:
   - Limit requests per user
   - Implement cooldown periods
   - Cache common responses

3. **Cost Controls**:
   - Set monthly budget caps
   - Implement usage analytics
   - Consider user tiers

## 🔗 Useful Links

- **OpenAI Docs**: https://platform.openai.com/docs
- **Anthropic Docs**: https://docs.anthropic.com/
- **Hugging Face**: https://huggingface.co/docs
- **Bible API**: https://bible-api.com/

## 💡 Pro Tips

1. **Start with OpenAI GPT-3.5**
   - Best balance of cost/quality
   - Fastest responses
   - Most documentation

2. **Test with Fallback Mode First**
   - Verify app works without API
   - Test user flows
   - Then add AI for enhancement

3. **Monitor Your Usage**
   - Set up billing alerts
   - Review usage weekly
   - Optimize prompts to reduce tokens

4. **Optimize Prompts**
   - Clear, specific system prompts
   - Limit response length
   - Request structured outputs

---

**Ready to integrate?** Start with OpenAI's free $5 credits! 🎉
