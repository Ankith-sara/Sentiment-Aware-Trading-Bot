/**
 * Simulates sentiment analysis using a mock implementation
 * In production, this would integrate with Hugging Face FinBERT or similar models
 */

export interface SentimentResult {
  score: number; // -1 to 1
  label: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0 to 1
}

export const analyzeSentiment = (text: string): SentimentResult => {
  // Mock sentiment analysis - in production, integrate with Hugging Face API
  const positiveWords = ['profit', 'gain', 'growth', 'positive', 'bullish', 'surge', 'record', 'beats', 'strong'];
  const negativeWords = ['loss', 'decline', 'negative', 'bearish', 'crash', 'concerns', 'volatility', 'uncertainty'];
  
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  let matchCount = 0;

  for (const word of words) {
    if (positiveWords.some(pw => word.includes(pw))) {
      score += 1;
      matchCount++;
    }
    if (negativeWords.some(nw => word.includes(nw))) {
      score -= 1;
      matchCount++;
    }
  }

  // Normalize score
  const normalizedScore = matchCount > 0 ? Math.max(-1, Math.min(1, score / matchCount)) : 0;
  
  // Add some randomness to simulate model uncertainty
  const finalScore = normalizedScore + (Math.random() - 0.5) * 0.3;
  const clampedScore = Math.max(-1, Math.min(1, finalScore));

  const label = clampedScore > 0.2 ? 'positive' : clampedScore < -0.2 ? 'negative' : 'neutral';
  const confidence = Math.abs(clampedScore) * 0.8 + 0.2; // Confidence between 0.2 and 1.0

  return {
    score: clampedScore,
    label,
    confidence
  };
};

export const generateTradingSignal = (
  sentimentScore: number,
  buyThreshold: number,
  sellThreshold: number
): { signal: 'BUY' | 'SELL' | 'HOLD'; confidence: number; reason: string } => {
  if (sentimentScore >= buyThreshold) {
    return {
      signal: 'BUY',
      confidence: Math.min(0.95, 0.6 + Math.abs(sentimentScore)),
      reason: `Strong positive sentiment (${sentimentScore.toFixed(2)}) exceeds buy threshold`
    };
  } else if (sentimentScore <= sellThreshold) {
    return {
      signal: 'SELL',
      confidence: Math.min(0.95, 0.6 + Math.abs(sentimentScore)),
      reason: `Negative sentiment (${sentimentScore.toFixed(2)}) below sell threshold`
    };
  } else {
    return {
      signal: 'HOLD',
      confidence: 0.5 + Math.random() * 0.3,
      reason: `Sentiment (${sentimentScore.toFixed(2)}) within hold range, awaiting stronger signals`
    };
  }
};