const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages) return res.status(400).json({ success: false, message: 'Messages required' });
    
    const reply = await aiService.chat(messages);
    res.json({ success: true, reply });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/ocr
router.post('/ocr', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ success: false, message: 'Image required' });
    
    const details = await aiService.analyzeFoodImage(imageBase64);
    
    // Attempt to parse JSON from the response if the model returned a markdown block
    let parsed = details;
    try {
      const jsonStr = details.match(/```json\n([\s\S]*?)\n```/);
      if (jsonStr && jsonStr[1]) {
        parsed = JSON.parse(jsonStr[1]);
      } else {
        parsed = JSON.parse(details);
      }
    } catch (e) {
      // If it's not JSON, return the raw text
    }

    res.json({ success: true, details: parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/translate
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) return res.status(400).json({ success: false, message: 'Text and targetLanguage required' });
    
    const translated = await aiService.translate(text, targetLanguage);
    res.json({ success: true, translated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/parse-speech
router.post('/parse-speech', async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) return res.status(400).json({ success: false, message: 'Transcript required' });
    
    const prompt = [
      { role: 'user', content: `Parse the following dictated text into a JSON object representing a food donation. Extract: title, description, quantity (number), unit (kg/liters/boxes/portions), and foodType (cooked/raw/packaged/bakery/beverages/fruits_vegetables/dairy/other). Return ONLY valid JSON without markdown formatting.\n\nText: "${transcript}"` }
    ];
    
    const rawResult = await aiService.chat(prompt);
    
    let parsed = rawResult;
    try {
      const jsonStr = rawResult.match(/```json\n([\s\S]*?)\n```/);
      if (jsonStr && jsonStr[1]) {
        parsed = JSON.parse(jsonStr[1]);
      } else {
        parsed = JSON.parse(rawResult);
      }
    } catch (e) {
      // Return raw if JSON parsing fails
    }

    res.json({ success: true, details: parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/optimize-route
router.post('/optimize-route', async (req, res) => {
  try {
    const { locations, startLocation } = req.body;
    if (!locations || locations.length === 0) return res.status(400).json({ success: false, message: 'Locations required' });
    
    // In a real scenario, we would use an LLM or a specialized TSP solver.
    // For this lightweight integration, we'll construct a prompt for the Llama model to order them.
    const prompt = [
      { 
        role: 'system', 
        content: 'You are an AI logistics expert. Given a starting location and a list of destinations, return a JSON array containing the optimal order (indices) to visit them to minimize total travel time and distance. Return ONLY the JSON array of indices.' 
      },
      { 
        role: 'user', 
        content: `Start: ${JSON.stringify(startLocation)}\nDestinations: ${JSON.stringify(locations.map((l, i) => ({ id: i, ...l })))}` 
      }
    ];

    const rawResult = await aiService.chat(prompt);
    
    let optimalOrder = locations.map((_, i) => i); // Fallback: original order
    try {
      const jsonStr = rawResult.match(/\[[\s\S]*?\]/);
      if (jsonStr && jsonStr[0]) {
        const parsed = JSON.parse(jsonStr[0]);
        if (Array.isArray(parsed) && parsed.length === locations.length) {
          optimalOrder = parsed;
        }
      }
    } catch (e) {
      console.error('Route optimization parsing failed', e);
    }

    res.json({ success: true, optimalOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/match
router.post('/match', async (req, res) => {
  try {
    const { listings, ngoDemand } = req.body;
    if (!listings || !ngoDemand) return res.status(400).json({ success: false, message: 'Listings and ngoDemand required' });
    
    const prompt = [
      {
        role: 'system',
        content: 'You are an AI food redistribution matcher. Given an NGO\'s demand profile and a list of available food listings, return a JSON array of the top 3 most relevant listing IDs, ordered by priority (expiry, distance, quantity, relevance). Return ONLY the JSON array of strings (the IDs).'
      },
      {
        role: 'user',
        content: `NGO Demand: "${ngoDemand}"\nListings: ${JSON.stringify(listings.map(l => ({ id: l._id, title: l.title, type: l.foodType, quantity: l.quantity, urgency: l.urgencyLevel })))}`
      }
    ];

    const rawResult = await aiService.chat(prompt);
    
    let topMatches = [];
    try {
      const jsonStr = rawResult.match(/\[[\s\S]*?\]/);
      if (jsonStr && jsonStr[0]) {
        topMatches = JSON.parse(jsonStr[0]);
      }
    } catch (e) {
      console.error('Match parsing failed', e);
    }

    res.json({ success: true, topMatches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
