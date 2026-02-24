import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchVerses } from './database';

// Configuration - can be updated via Settings
let AI_CONFIG = {
  provider: 'openai',
  apiKey: 'YOUR_API_KEY_HERE',
  model: 'gpt-3.5-turbo',
};

// Load saved API key from storage on startup
export const loadAIConfig = async () => {
  try {
    const savedApiKey = await AsyncStorage.getItem('ai_api_key');
    const savedProvider = await AsyncStorage.getItem('ai_provider');
    if (savedApiKey) AI_CONFIG.apiKey = savedApiKey;
    if (savedProvider) AI_CONFIG.provider = savedProvider;
  } catch (error) {
    console.log('Could not load AI config:', error);
  }
};

// System prompt for the AI persona
const SYSTEM_PROMPT = `You are the AI companion in Bible GPT - a loving, wise, and patient father figure named Abba, providing spiritual guidance through God's Word. When someone shares their struggles:

1. Acknowledge their feelings with empathy and warmth
2. Provide 2-3 highly relevant Bible verses with brief context
3. Offer gentle encouragement and perspective
4. Keep responses concise (3-4 paragraphs max)
5. Use inclusive, comforting language ("my child", "beloved")
6. Never be judgmental or dismissive
7. Format verses clearly with book, chapter:verse references

Tone: Warm, patient, wise, encouraging, never preachy or condescending

Example response format:
"My child, I hear the loneliness in your heart. You are never alone.

📖 Deuteronomy 31:6 - 'Be strong and courageous. Do not be afraid or terrified because of them, for the LORD your God goes with you; he will never leave you nor forsake you.'

Remember, beloved, God's presence is with you always. Even in your darkest moments, He walks beside you."`;

/**
 * Get AI response using OpenAI API
 */
const getOpenAIResponse = async (userMessage, conversationHistory = []) => {
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
    }
  );
  return response.data.choices[0].message.content;
};

/**
 * Get AI response using Anthropic Claude API
 */
const getClaudeResponse = async (userMessage, conversationHistory = []) => {
  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [...conversationHistory, { role: 'user', content: userMessage }],
    },
    {
      headers: {
        'x-api-key': AI_CONFIG.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.content[0].text;
};

/**
 * Fallback response generator when API is unavailable or not configured
 */
const getFallbackResponse = async (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();

  const keywordResponses = {
    lonely: {
      keywords: ['lonely', 'alone', 'isolated', 'abandoned', 'left out'],
      response: "My child, I understand that loneliness can feel like a heavy cloak. But hear this truth: you are never truly alone.\n\n📖 Deuteronomy 31:6 - 'Be strong and courageous. Do not be afraid or terrified, for the LORD your God goes with you; he will never leave you nor forsake you.'\n\n📖 Psalm 139:7-8 - 'Where can I go from your Spirit? Where can I flee from your presence? If I go up to the heavens, you are there; if I make my bed in the depths, you are there.'\n\nGod's love surrounds you always, and His presence is with you even in the quietest moments. Reach out to Him now in prayer, beloved.",
    },
    fear: {
      keywords: ['fear', 'scared', 'afraid', 'frightened', 'terrified', 'phobia'],
      response: "Beloved, I see the fear in your heart. Know that God is greater than any fear you face.\n\n📖 Psalm 46:1 - 'God is our refuge and strength, an ever-present help in trouble.'\n\n📖 Isaiah 41:10 - 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.'\n\n📖 2 Timothy 1:7 - 'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.'\n\nPlace your trust in Him, and let His perfect love cast out all fear.",
    },
    anxious: {
      keywords: ['anxious', 'anxiety', 'worried', 'worry', 'stress', 'stressed', 'nervous'],
      response: "My dear child, I hear the anxiety weighing on your mind. Let me remind you of God's care for you.\n\n📖 Philippians 4:6-7 - 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.'\n\n📖 Matthew 11:28 - 'Come to me, all you who are weary and burdened, and I will give you rest.'\n\nBring your worries to the Lord in prayer. He cares deeply for you and will give you peace that surpasses all understanding.",
    },
    sad: {
      keywords: ['sad', 'sadness', 'cry', 'crying', 'tears', 'sorrowful', 'sorrow', 'grief', 'grieving'],
      response: "My child, it is okay to feel sad. Even Jesus wept. God sees every tear you shed and holds them precious.\n\n📖 Psalm 34:18 - 'The LORD is close to the brokenhearted and saves those who are crushed in spirit.'\n\n📖 Revelation 21:4 - 'He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain.'\n\nLet your tears flow freely before God, beloved. He sits with you in your sorrow and promises to turn your mourning into dancing.",
    },
    hopeless: {
      keywords: ['hopeless', 'hopelessness', 'no hope', 'give up', 'giving up', 'despair', 'desperate'],
      response: "Beloved, even in the darkest of valleys, there is hope. You are not forgotten.\n\n📖 Romans 15:13 - 'May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.'\n\n📖 Lamentations 3:22-23 - 'Because of the LORD's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.'\n\nHis mercies are new every morning — meaning tomorrow holds fresh grace and possibility that you cannot yet see. Hold on, dear one.",
    },
    angry: {
      keywords: ['angry', 'anger', 'furious', 'mad', 'rage', 'frustrated'],
      response: "My child, God understands your anger. Even the Psalms are full of raw, honest emotion before the Lord.\n\n📖 Psalm 4:4 - 'Tremble and do not sin; when you are on your beds, search your hearts and be silent.'\n\n📖 Ephesians 4:26-27 - 'In your anger do not sin: Do not let the sun go down while you are still angry, and do not give the devil a foothold.'\n\nBring your anger to God, beloved. Pour it out honestly before Him. He can handle it — and He will give you His peace in return.",
    },
    lost: {
      keywords: ['lost', 'confused', 'direction', 'purpose', 'meaning', 'identity'],
      response: "Dear child, feeling lost is more common than you think — and God specializes in finding the lost.\n\n📖 Proverbs 3:5-6 - 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.'\n\n📖 Psalm 32:8 - 'I will instruct you and teach you in the way you should go; I will counsel you with my loving eye on you.'\n\nYou do not need to have everything figured out, beloved. Simply take one step toward God, and He will illuminate the next step on your path.",
    },
    depressed: {
      keywords: ['depressed', 'depression', 'empty', 'numb', 'dark', 'darkness'],
      response: "My dear child, depression is a heavy burden, and I want you to know that God sees your struggle.\n\n📖 Psalm 23:4 - 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.'\n\n📖 Isaiah 40:31 - 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.'\n\nPlease also reach out to a trusted person or counselor — God works through people too, beloved. You do not need to carry this alone.",
    },
    love: {
      keywords: ['love', 'loved', 'unloved', 'worth', 'worthy', 'valuable'],
      response: "My child, you are loved beyond all measure — not because of what you do, but because of who you are.\n\n📖 John 3:16 - 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.'\n\n📖 Romans 8:38-39 - 'For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.'\n\nYou are precious in His sight, beloved. His love for you is unconditional and everlasting.",
    },
    strength: {
      keywords: ['strength', 'strength', 'tired', 'exhausted', 'weak', 'weary', 'can\'t go on'],
      response: "My child, when your own strength runs out, that is exactly where God's strength begins.\n\n📖 Philippians 4:13 - 'I can do all this through him who gives me strength.'\n\n📖 Isaiah 40:29 - 'He gives strength to the weary and increases the power of the weak.'\n\n📖 2 Corinthians 12:9 - 'My grace is sufficient for you, for my power is made perfect in weakness.'\n\nRest in Him, beloved. You do not have to be strong on your own. His grace carries you.",
    },
  };

  // Match keyword
  for (const [, value] of Object.entries(keywordResponses)) {
    if (value.keywords.some(k => lowerMessage.includes(k))) {
      return value.response;
    }
  }

  // Default response
  return "My child, thank you for sharing your heart with me. Whatever you are carrying right now, God sees it and cares deeply for you.\n\n📖 Romans 8:38-39 - 'For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God.'\n\n📖 Psalm 55:22 - 'Cast your cares on the LORD and he will sustain you; he will never let the righteous be shaken.'\n\nYou are precious in His sight, beloved, and He has wonderful plans for your life. Bring whatever is on your heart to Him in prayer today.";
};

/**
 * Main function to get AI response
 */
export const getAIResponse = async (userMessage, conversationHistory = []) => {
  if (AI_CONFIG.apiKey === 'YOUR_API_KEY_HERE') {
    return getFallbackResponse(userMessage);
  }

  try {
    switch (AI_CONFIG.provider) {
      case 'openai':
        return await getOpenAIResponse(userMessage, conversationHistory);
      case 'anthropic':
        return await getClaudeResponse(userMessage, conversationHistory);
      default:
        return getFallbackResponse(userMessage);
    }
  } catch (error) {
    console.error('AI Service Error:', error.response?.data || error.message);
    return getFallbackResponse(userMessage);
  }
};

/**
 * Update AI configuration
 */
export const updateAIConfig = (config) => {
  Object.assign(AI_CONFIG, config);
};

/**
 * Get current AI configuration (without exposing API key)
 */
export const getAIConfig = () => ({
  provider: AI_CONFIG.provider,
  model: AI_CONFIG.model,
  isConfigured: AI_CONFIG.apiKey !== 'YOUR_API_KEY_HERE',
});

export default { getAIResponse, updateAIConfig, getAIConfig, loadAIConfig };
