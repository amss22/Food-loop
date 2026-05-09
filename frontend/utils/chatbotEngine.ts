import { chatbotIntents, ChatIntent } from '../data/chatbotIntents';

/**
 * Normalizes text for better matching
 */
function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/gi, '').trim();
}

/**
 * Calculates a simple similarity score between two strings
 */
function similarity(s1: string, s2: string): number {
  const words1 = new Set(s1.split(' '));
  const words2 = new Set(s2.split(' '));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  let matchCount = 0;
  for (const w1 of words1) {
    if (words2.has(w1)) matchCount++;
  }
  
  // Return percentage of matched words based on the shorter string
  return matchCount / Math.min(words1.size, words2.size);
}

/**
 * Finds the best matching intent for a given query
 */
export function findBestIntent(query: string): ChatIntent | null {
  const normQuery = normalize(query);
  const queryWords = normQuery.split(' ');
  
  let bestIntent: ChatIntent | null = null;
  let highestScore = 0;

  for (const intent of chatbotIntents) {
    let currentMaxScore = 0;

    // 1. Check exact or high-similarity variation match (heaviest weight)
    for (const variation of intent.variations) {
      const sim = similarity(normQuery, normalize(variation));
      if (sim > currentMaxScore) currentMaxScore = sim;
    }

    // 2. Check keyword matches
    let keywordMatches = 0;
    for (const keyword of intent.keywords) {
      if (queryWords.some(w => w.includes(normalize(keyword)) || normalize(keyword).includes(w))) {
        keywordMatches++;
      }
    }
    const keywordScore = keywordMatches / intent.keywords.length;

    // Combine scores (Variation match is 70% of score, Keyword match is 30%)
    const finalScore = (currentMaxScore * 0.7) + (keywordScore * 0.3);

    if (finalScore > highestScore) {
      highestScore = finalScore;
      bestIntent = intent;
    }
  }

  // Threshold to avoid returning random answers for unrelated questions
  if (highestScore > 0.35) {
    return bestIntent;
  }
  
  return null;
}

/**
 * Gets all unique categories for the FAQ UI
 */
export function getCategories(): string[] {
  const categories = new Set<string>();
  chatbotIntents.forEach(i => categories.add(i.category));
  return Array.from(categories);
}

/**
 * Gets intents by category
 */
export function getIntentsByCategory(category: string): ChatIntent[] {
  return chatbotIntents.filter(i => i.category === category);
}
