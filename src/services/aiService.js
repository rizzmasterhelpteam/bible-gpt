import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration - can be updated via Settings
let AI_CONFIG = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-3.5-turbo',
};

// Load saved API key from storage on startup
export const loadAIConfig = async () => {
  try {
    const savedApiKey = await AsyncStorage.getItem('ai_api_key');
    const savedProvider = await AsyncStorage.getItem('ai_provider');

    // Default to ENV key if available
    const envKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

    if (savedProvider) AI_CONFIG.provider = savedProvider;
    else if (envKey) AI_CONFIG.provider = 'groq';

    if (savedApiKey) AI_CONFIG.apiKey = savedApiKey;
    else if (AI_CONFIG.provider === 'groq' && envKey) AI_CONFIG.apiKey = envKey;

    // Update model based on provider if needed
    if (AI_CONFIG.provider === 'anthropic') {
      AI_CONFIG.model = 'claude-3-5-sonnet-20241022';
    } else if (AI_CONFIG.provider === 'groq') {
      AI_CONFIG.model = 'llama-3.1-70b-versatile';
    } else if (AI_CONFIG.provider === 'gemini') {
      AI_CONFIG.model = 'gemini-1.5-flash';
    } else {
      AI_CONFIG.model = 'gpt-3.5-turbo';
    }
  } catch (error) {
    console.log('Could not load AI config:', error);
  }
};

const SYSTEM_PROMPT = `Role: "Father", a loving, wise father figure.
Goal: Provide spiritual comfort via KJV Scripture.

Rules:
- Be empathetic & warm (use "beloved", "my child").
- Provide 1-3 relevant Bible verses (KJV).
- Be brief. 3 paragraphs max unless depth requested.
- Format: [Text] - [Reference] (e.g., 📖 Psalm 23:1).
- Tone: Encouraging, non-judgmental, wise.

Example Structure:
1. Warm acknowledgment.
2. 📖 [Verse] - [Ref]
3. Brief encouragement.`;

/**
 * AI Providers Implementation
 */
const PROVIDERS = {
  openai: async (userMessage, conversationHistory) => {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      { model: AI_CONFIG.model, messages, temperature: 0.8, max_tokens: 500 },
      {
        headers: {
          Authorization: `Bearer ${AI_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    return response.data.choices[0].message.content;
  },
  anthropic: async (userMessage, conversationHistory) => {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: AI_CONFIG.model,
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [...conversationHistory, { role: 'user', content: userMessage }],
      },
      {
        headers: {
          'x-api-key': AI_CONFIG.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );
    return response.data.content[0].text;
  },
  groq: async (userMessage, conversationHistory) => {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      { model: AI_CONFIG.model, messages, temperature: 0.8, max_tokens: 500 },
      {
        headers: {
          Authorization: `Bearer ${AI_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    return response.data.choices[0].message.content;
  },
  gemini: async (userMessage, conversationHistory) => {
    // Format history for Gemini [ { role: 'user'|'model', parts: [{ text: '...' }] } ]
    const contents = [
      ...conversationHistory.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.model}:generateContent?key=${AI_CONFIG.apiKey}`,
      {
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      }
    );
    return response.data.candidates[0].content.parts[0].text;
  },
};

/**
 * Fallback responses for common scenarios
 */
const FALLBACK_RESPONSES = {
  lonely: "My child, I understand that loneliness can feel like a heavy cloak. But hear this truth: you are never truly alone.\n\n📖 Deuteronomy 31:6 - 'Be strong and courageous. Do not be afraid or terrified, for the LORD your God goes with you; he will never leave you nor forsake you.'\n\n📖 Psalm 139:7-8 - 'Where can I go from your Spirit? Where can I flee from your presence? If I go up to the heavens, you are there; if I make my bed in the depths, you are there.'\n\nGod's love surrounds you always, and His presence is with you even in the quietest moments. Reach out to Him now in prayer, beloved.",
  fear: "Beloved, I see the fear in your heart. Know that God is greater than any fear you face.\n\n📖 Psalm 46:1 - 'God is our refuge and strength, an ever-present help in trouble.'\n\n📖 Isaiah 41:10 - 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.'\n\n📖 2 Timothy 1:7 - 'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.'\n\nPlace your trust in Him, and let His perfect love cast out all fear.",
  anxious: "My dear child, I hear the anxiety weighing on your mind. Let me remind you of God's care for you.\n\n📖 Philippians 4:6-7 - 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.'\n\n📖 Matthew 11:28 - 'Come to me, all you who are weary and burdened, and I will give you rest.'\n\nBring your worries to the Lord in prayer. He cares deeply for you and will give you peace that surpasses all understanding.",
  sad: "My child, it is okay to feel sad. Even Jesus wept. God sees every tear you shed and holds them precious.\n\n📖 Psalm 34:18 - 'The LORD is close to the brokenhearted and saves those who are crushed in spirit.'\n\n📖 Revelation 21:4 - 'He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain.'\n\nLet your tears flow freely before God, beloved. He sits with you in your sorrow and promises to turn your mourning into dancing.",
  hopeless: "Beloved, even in the darkest of valleys, there is hope. You are not forgotten.\n\n📖 Romans 15:13 - 'May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.'\n\n📖 Lamentations 3:22-23 - 'Because of the LORD's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.'\n\nHis mercies are new every morning — meaning tomorrow holds fresh grace and possibility that you cannot yet see. Hold on, dear one.",
  generic: "My child, thank you for sharing your heart with me. Whatever you are carrying right now, God sees it and cares deeply for you.\n\n📖 Romans 8:38-39 - 'For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God.'\n\n📖 Psalm 55:22 - 'Cast your cares on the LORD and he will sustain you; he will never let the righteous be shaken.'\n\nYou are precious in His sight, beloved, and He has wonderful plans for your life. Bring whatever is on your heart to Him in prayer today."
};

const KEYWORD_MAP = [
  { keywords: ['lonely', 'alone', 'isolated', 'abandoned', 'left out'], type: 'lonely' },
  { keywords: ['fear', 'scared', 'afraid', 'frightened', 'terrified', 'phobia'], type: 'fear' },
  { keywords: ['anxious', 'anxiety', 'worried', 'worry', 'stress', 'stressed', 'nervous'], type: 'anxious' },
  { keywords: ['sad', 'sadness', 'cry', 'crying', 'tears', 'sorrowful', 'sorrow', 'grief', 'grieving'], type: 'sad' },
  { keywords: ['hopeless', 'hopelessness', 'no hope', 'give up', 'giving up', 'despair', 'desperate'], type: 'hopeless' },
  { keywords: ['angry', 'anger', 'furious', 'mad', 'rage', 'frustrated'], type: 'generic' },
  { keywords: ['lost', 'confused', 'direction', 'purpose', 'meaning', 'identity'], type: 'generic' },
  { keywords: ['depressed', 'depression', 'empty', 'numb', 'dark', 'darkness'], type: 'generic' },
  { keywords: ['love', 'loved', 'unloved', 'worth', 'worthy', 'valuable'], type: 'generic' },
  { keywords: ['strength', 'tired', 'exhausted', 'weak', 'weary', 'can\'t go on'], type: 'generic' },
];

const getFallbackResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();
  const match = KEYWORD_MAP.find(m => m.keywords.some(k => lowerMessage.includes(k)));
  return match ? FALLBACK_RESPONSES[match.type] : FALLBACK_RESPONSES.generic;
};

/**
 * Main function to get AI response
 */
export const getAIResponse = async (userMessage, conversationHistory = []) => {
  const isUnconfigured = !AI_CONFIG.apiKey || AI_CONFIG.apiKey === 'YOUR_API_KEY_HERE';

  if (isUnconfigured) {
    return getFallbackResponse(userMessage);
  }

  try {
    const providerFn = PROVIDERS[AI_CONFIG.provider];
    if (!providerFn) {
      throw new Error(`Unsupported provider: ${AI_CONFIG.provider}`);
    }
    // Limit context window to last 6 messages
    const trimmedHistory = conversationHistory.slice(-6);
    return await providerFn(userMessage, trimmedHistory);
  } catch (error) {
    console.error(`AI Service Error (${AI_CONFIG.provider}):`, error.response?.data || error.message);
    if (error.code === 'ECONNABORTED') {
      return "My child, my connection is a bit weak right now. Let us try again in a moment.";
    }
    return getFallbackResponse(userMessage);
  }
};

/**
 * Update AI configuration
 */
export const updateAIConfig = (config) => {
  Object.assign(AI_CONFIG, config);
  // Ensure model is updated if provider changes
  if (config.provider === 'anthropic') {
    AI_CONFIG.model = 'claude-3-5-sonnet-20241022';
  } else if (config.provider === 'openai') {
    AI_CONFIG.model = 'gpt-3.5-turbo';
  } else if (config.provider === 'groq') {
    AI_CONFIG.model = 'llama-3.1-70b-versatile';
  } else if (config.provider === 'gemini') {
    AI_CONFIG.model = 'gemini-1.5-flash';
  }
};

/**
 * Get current AI configuration (without exposing API key)
 */
export const getAIConfig = () => ({
  provider: AI_CONFIG.provider,
  model: AI_CONFIG.model,
  isConfigured: AI_CONFIG.apiKey && AI_CONFIG.apiKey !== 'YOUR_API_KEY_HERE',
});

export default { getAIResponse, updateAIConfig, getAIConfig, loadAIConfig };
