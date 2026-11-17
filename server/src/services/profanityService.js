const { Filter } = require('bad-words');

// Initialize base filter
const filter = new Filter();

// Additional abusive / offensive words often found in customer service / healthcare disputes
const customBadWords = [
  'fraud',
  'thief',
  'chor',
  'bakwaas',
  'ghatiya',
  'pathetic',
  'useless',
  'idiot',
  'stupid',
  'disgusting',
  'harami',
  'scammer',
  'bastard',
  'bloody',
  'asshole',
  'bitch',
  'horrible',
  'cheat',
  'looter',
  'worst'
];

try {
  filter.addWords(...customBadWords);
} catch (e) {
  // Ignore duplicates
}

/**
 * Checks text for abusive language, returns flagged status, censored text and detected words.
 * @param {string} text
 * @returns {{ isAbusive: boolean, flaggedWords: string[], censoredText: string }}
 */
function analyzeProfanity(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return {
      isAbusive: false,
      flaggedWords: [],
      censoredText: text || ''
    };
  }

  const words = text.split(/\s+/);
  const flagged = [];

  for (const rawWord of words) {
    const cleanWord = rawWord.toLowerCase().replace(/[^a-z0-9]/gi, '');
    if (cleanWord && (filter.isProfane(cleanWord) || customBadWords.includes(cleanWord))) {
      if (!flagged.includes(cleanWord)) {
        flagged.push(cleanWord);
      }
    }
  }

  let censored = text;
  try {
    censored = filter.clean(text);
  } catch (err) {
    // Fallback manual regex mask if bad-words cleaner encounters special characters
    customBadWords.forEach((word) => {
      const reg = new RegExp(`\\b${word}\\b`, 'gi');
      censored = censored.replace(reg, '*'.repeat(word.length));
    });
  }

  // Also mask custom words if clean() missed any
  customBadWords.forEach((word) => {
    const reg = new RegExp(`\\b${word}\\b`, 'gi');
    censored = censored.replace(reg, '*'.repeat(word.length));
  });

  return {
    isAbusive: flagged.length > 0,
    flaggedWords: flagged,
    censoredText: censored
  };
}

module.exports = {
  analyzeProfanity
};
