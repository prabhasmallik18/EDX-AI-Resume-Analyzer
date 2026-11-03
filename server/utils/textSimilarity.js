const { STOP_WORDS } = require("./keywordMatcher");

/**
 * Cosine similarity between two texts (0 = nothing in common, 1 = identical words).
 *
 * How it works, in simple steps:
 *  1. Split each text into words, drop common words ("the", "and"...).
 *  2. Count how often each word appears (a "word vector").
 *  3. Cosine similarity = how much the two vectors point in the same direction.
 * This is the same idea search engines use to compare documents.
 */
const tokenize = (text) =>
  String(text || "")
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word) && !/^\d+$/.test(word))
    // very light "stemming": developers -> developer, apis -> api
    .map((word) => (word.length > 4 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word));

const termVector = (tokens) => {
  const vector = new Map();
  tokens.forEach((token) => vector.set(token, (vector.get(token) || 0) + 1));
  // sublinear scaling: seeing a word 10 times is not 10x more important than once
  vector.forEach((count, token) => vector.set(token, 1 + Math.log(count)));
  return vector;
};

const cosineSimilarity = (textA, textB) => {
  const a = termVector(tokenize(textA));
  const b = termVector(tokenize(textB));

  if (a.size === 0 || b.size === 0) return 0;

  let dot = 0;
  a.forEach((weight, token) => {
    if (b.has(token)) dot += weight * b.get(token);
  });

  const norm = (vector) => Math.sqrt([...vector.values()].reduce((sum, w) => sum + w * w, 0));
  const denominator = norm(a) * norm(b);

  return denominator === 0 ? 0 : dot / denominator;
};

module.exports = { cosineSimilarity, tokenize };
