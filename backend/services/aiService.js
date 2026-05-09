const axios = require('axios');

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

const aiService = {
  /**
   * Chat / Assistant functionality
   */
  async chat(messages, context = {}) {
    try {
      const response = await axios.post(
        `${NVIDIA_BASE_URL}/chat/completions`,
        {
          model: 'meta/llama-3.1-405b-instruct',
          messages: [
            {
              role: 'system',
              content: 'You are FoodLoop AI, a helpful assistant for a food redistribution platform. You help users donate food, find NGOs, and understand rescue logistics. Keep responses professional, minimal, and focused on sustainability.',
            },
            ...messages,
          ],
          temperature: 0.2,
          max_tokens: 512,
        },
        {
          headers: {
            Authorization: `Bearer ${NVIDIA_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('NVIDIA AI Chat Error:', error.response?.data || error.message);
      return "I'm sorry, I'm having trouble connecting to my AI brain right now. How can I help you manually?";
    }
  },

  /**
   * Image to Text / OCR for food listings
   */
  async analyzeFoodImage(imageBase64) {
    try {
      const response = await axios.post(
        `${NVIDIA_BASE_URL}/chat/completions`,
        {
          model: 'meta/llama-3.2-11b-vision-instruct',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Extract food details from this image. Return a JSON object with: title, quantity, foodType (cooked/bakery/packaged/fruits_vegetables/dairy), and expirySuggestion (hours left). If it looks like a receipt, extract the items.' },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
              ]
            }
          ],
          max_tokens: 512,
        },
        {
          headers: {
            Authorization: `Bearer ${NVIDIA_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('NVIDIA AI Vision Error:', error.response?.data || error.message);
      throw new Error('Failed to analyze image');
    }
  },

  /**
   * Translation
   */
  async translate(text, targetLanguage) {
    try {
      const response = await axios.post(
        `${NVIDIA_BASE_URL}/chat/completions`,
        {
          model: 'meta/llama-3.1-70b-instruct',
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the following text to ${targetLanguage}. Return ONLY the translated text.`,
            },
            { role: 'user', content: text },
          ],
          temperature: 0.1,
        },
        {
          headers: {
            Authorization: `Bearer ${NVIDIA_API_KEY}`,
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('NVIDIA AI Translation Error:', error.message);
      return text; // Fallback to original text
    }
  },

  /**
   * Smart Matching / Ranking Logic
   * This is more of an algorithmic layer that can use AI to weight features
   */
  async rankListings(listings, ngoPreferences) {
    // We can use an LLM to score listings based on complex text-based demand
    // For now, we'll simulate a prompt that ranks them
    return listings.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
  }
};

module.exports = aiService;
