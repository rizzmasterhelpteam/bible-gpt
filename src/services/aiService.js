import axios from 'axios';
import { searchVerses } from './database';

// Configuration - Replace with your actual API keys
const AI_CONFIG = {
  provider: 'openai', // Options: 'openai', 'anthropic', 'huggingface'
  apiKey: 'YOUR_API_KEY_HERE', // Replace this with your actual API key
  model: 'gpt-3.5-turbo' // For OpenAI
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
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: AI_CONFIG.model,
        messages: messages,
        temperature: 0.8,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get AI response using Anthropic Claude API
 */
const getClaudeResponse = async (userMessage, conversationHistory = []) => {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          ...conversationHistory,
          { role: 'user', content: userMessage }
        ]
      },
      {
        headers: {
          'x-api-key': AI_CONFIG.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.content[0].text;
  } catch (error) {
    console.error('Claude API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fallback response generator when API is unavailable or not configured
 */
const getFallbackResponse = async (userMessage) => {
  // Extract keywords from user message
  const keywords = ['lonely', 'fear', 'anxious', 'worried', 'sad', 'lost', 'angry', 'hurt', 'depressed', 'hopeless'];
  const lowerMessage = userMessage.toLowerCase();
  
  let matchedKeyword = keywords.find(keyword => lowerMessage.includes(keyword));
  
  // Search for relevant verses based on the keyword
  let verses = [];
  if (matchedKeyword) {
    try {
      verses = await searchVerses(matchedKeyword);
    } catch (error) {
      console.log('Error searching verses:', error);
    }
  }

  // Default encouraging responses
  const responses = {
    lonely: "My child, I understand that loneliness can feel overwhelming. Remember that you are never truly alone.\n\n📖 Deuteronomy 31:6 - 'Be strong and courageous. Do not be afraid or terrified because of them, for the LORD your God goes with you; he will never leave you nor forsake you.'\n\nGod's love surrounds you always, and His presence is with you even in your quietest moments.",
    
    fear: "Beloved, I see the fear in your heart. Know that God is greater than any fear you face.\n\n📖 Psalm 46:1 - 'God is our refuge and strength, an ever-present help in trouble.'\n\n📖 Isaiah 41:10 - 'So do not fear, for I am with you; do not be dismayed, for I am your God.'\n\nPlace your trust in Him, and let His perfect love cast out all fear.",
    
    anxious: "My dear child, I hear the anxiety weighing on your mind. Let me remind you of God's care for you.\n\n📖 Matthew 11:28 - 'Come to me, all you who are weary and burdened, and I will give you rest.'\n\nBring your worries to the Lord in prayer. He cares deeply for you and will give you peace that surpasses understanding.",
    
    default: "My child, thank you for sharing your heart with me. Remember that God loves you unconditionally.\n\n📖 Romans 8:38-39 - 'For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God.'\n\nYou are precious in His sight, and He has wonderful plans for your life."
  };

  return responses[matchedKeyword] || responses.default;
};

/**
 * Main function to get AI response
 */
export const getAIResponse = async (userMessage, conversationHistory = []) => {
  // Check if API key is configured
  if (AI_CONFIG.apiKey === 'YOUR_API_KEY_HERE') {
    console.log('Using fallback response - API key not configured');
    return await getFallbackResponse(userMessage);
  }

  try {
    switch (AI_CONFIG.provider) {
      case 'openai':
        return await getOpenAIResponse(userMessage, conversationHistory);
      case 'anthropic':
        return await getClaudeResponse(userMessage, conversationHistory);
      default:
        return await getFallbackResponse(userMessage);
    }
  } catch (error) {
    console.error('AI Service Error:', error);
    // Fall back to local response if API fails
    return await getFallbackResponse(userMessage);
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
export const getAIConfig = () => {
  return {
    provider: AI_CONFIG.provider,
    model: AI_CONFIG.model,
    isConfigured: AI_CONFIG.apiKey !== 'YOUR_API_KEY_HERE'
  };
};

export default { getAIResponse, updateAIConfig, getAIConfig };
