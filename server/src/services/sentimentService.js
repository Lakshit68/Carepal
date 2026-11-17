const Sentiment = require('sentiment');
const sentimentAnalyzer = new Sentiment();

// Healthcare & nursing domain vocabulary extensions
const domainLexicon = {
  attentive: 3,
  caring: 3,
  compassionate: 4,
  gentle: 3,
  punctual: 3,
  polite: 2,
  reassuring: 3,
  diligent: 3,
  professional: 3,
  unprofessional: -3,
  rude: -3,
  careless: -4,
  negligent: -5,
  late: -2,
  disrespectful: -4,
  rough: -3,
  inattentive: -3,
  untrained: -4,
  hygienic: 2,
  unhygienic: -4,
  dirty: -3
};

sentimentAnalyzer.registerLanguage('en-care', {
  labels: domainLexicon
});

/**
 * Analyzes sentiment of comment, optionally reinforced by overall rating.
 * @param {string} comment
 * @param {number} overallRating (1-5)
 * @returns {{ sentiment: 'positive' | 'neutral' | 'negative', score: number, comparative: number }}
 */
function analyzeSentiment(comment, overallRating = 3) {
  if (!comment || typeof comment !== 'string' || comment.trim() === '') {
    // Fallback to rating-based sentiment if no text comment
    if (overallRating >= 4.0) {
      return { sentiment: 'positive', score: 2, comparative: 0.5 };
    } else if (overallRating <= 2.5) {
      return { sentiment: 'negative', score: -2, comparative: -0.5 };
    } else {
      return { sentiment: 'neutral', score: 0, comparative: 0 };
    }
  }

  const result = sentimentAnalyzer.analyze(comment, { language: 'en-care' });
  const rawScore = result.score;
  const comp = result.comparative;

  let sentiment = 'neutral';

  if (comp > 0.08 || rawScore >= 2) {
    sentiment = 'positive';
  } else if (comp < -0.05 || rawScore <= -1) {
    sentiment = 'negative';
  } else {
    // Borderline/ambiguous score: use overallRating as tie-breaker
    if (overallRating >= 4.5 && comp >= 0) {
      sentiment = 'positive';
    } else if (overallRating <= 2.0 && comp <= 0) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }
  }

  return {
    sentiment,
    score: rawScore,
    comparative: comp
  };
}

module.exports = {
  analyzeSentiment
};
