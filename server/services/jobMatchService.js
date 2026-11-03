const { matchKeywords } = require("../utils/keywordMatcher");
const { cosineSimilarity, tokenize } = require("../utils/textSimilarity");
const aiService = require("./aiService");
const { getEngineMode } = require("./analysisService");

// Local score = mix of 3 measurements (weights add up to 1).
const LOCAL_WEIGHTS_WITH_TITLE = { keywords: 0.65, similarity: 0.25, title: 0.1 };
const LOCAL_WEIGHTS_NO_TITLE = { keywords: 0.7, similarity: 0.3, title: 0 };
// In hybrid mode the AI's opinion counts half.
const AI_SHARE = 0.5;
// Resume vs job cosine similarity of 0.35 is already a very close match, so it maps to 100.
const SIMILARITY_FULL_MARKS = 0.35;

const clamp = (value) => Math.min(100, Math.max(0, Math.round(value)));

const titleScore = (resumeText, jobTitle) => {
  const titleWords = [...new Set(tokenize(jobTitle))];
  if (titleWords.length === 0) return null;

  const resumeWords = new Set(tokenize(resumeText));
  return (titleWords.filter((word) => resumeWords.has(word)).length / titleWords.length) * 100;
};

const buildLocalAdvice = ({ keywordResult, similarityScore, score, jobTitle, titleMatch }) => {
  const { matchedKeywords, missingKeywords, totalKeywords } = keywordResult;

  const closeness =
    similarityScore >= 60 ? "close to" : similarityScore >= 35 ? "partly similar to" : "quite different from";
  const outcome =
    score >= 75
      ? "You look like a good fit, so tailor a few bullet points and apply."
      : score >= 50
      ? "Closing the missing keywords below would raise your chances."
      : "This job needs several skills your resume does not show yet.";

  const summary =
    `Your resume covers ${matchedKeywords.length} of ${totalKeywords} key requirements in this job ` +
    `(${keywordResult.keywordScore}% keyword match), and its wording is ${closeness} the job description. ${outcome}`;

  const strengthsForRole = [];
  if (matchedKeywords.length > 0) {
    strengthsForRole.push(`You already show ${matchedKeywords.slice(0, 6).join(", ")}, which this job asks for.`);
  }
  if (titleMatch !== null && titleMatch >= 60) {
    strengthsForRole.push(`Your resume already uses words from the job title "${jobTitle}".`);
  }

  const suggestions = missingKeywords.slice(0, 4).map(
    (keyword) =>
      `The job asks for ${keyword}, but it is not on your resume. If you have used it, add it to your Skills section and to one project or experience bullet. If not, consider learning it.`
  );
  if (titleMatch !== null && titleMatch < 60) {
    suggestions.push(`Use the job's own title ("${jobTitle}") in your Summary or headline so an ATS links you to this role.`);
  }
  if (keywordResult.keywordScore < 50) {
    suggestions.push("Rank the job's requirements by importance and make sure the top three appear in your first project or experience entry.");
  }
  if (suggestions.length === 0) {
    suggestions.push("Your resume already covers this job well. Mirror the job's exact wording in two or three bullet points.");
  }

  return { summary, strengthsForRole: strengthsForRole.slice(0, 5), suggestions: suggestions.slice(0, 6) };
};

/**
 * Compare one resume with one job description.
 *
 * Step 1 (always)   keyword check + word-similarity + title check  -> our own score
 * Step 2 (optional) Gemini opinion, only when ANALYSIS_ENGINE=hybrid
 */
const matchResumeToJob = async (resumeText, jobDescription, jobTitle = "") => {
  const keywordResult = matchKeywords(resumeText, jobDescription);
  const similarityScore = clamp((cosineSimilarity(resumeText, jobDescription) / SIMILARITY_FULL_MARKS) * 100);
  const titleMatch = titleScore(resumeText, jobTitle);

  const weights = titleMatch === null ? LOCAL_WEIGHTS_NO_TITLE : LOCAL_WEIGHTS_WITH_TITLE;
  const localScore = clamp(
    keywordResult.keywordScore * weights.keywords +
      similarityScore * weights.similarity +
      (titleMatch || 0) * weights.title
  );

  const advice = buildLocalAdvice({ keywordResult, similarityScore, score: localScore, jobTitle, titleMatch });

  const result = {
    matchScore: localScore,
    keywordScore: keywordResult.keywordScore,
    similarityScore,
    aiScore: null,
    matchedKeywords: keywordResult.matchedKeywords,
    missingKeywords: keywordResult.missingKeywords.slice(0, 15),
    summary: advice.summary,
    strengthsForRole: advice.strengthsForRole,
    suggestions: advice.suggestions,
    aiUsed: false,
    engine: "local",
  };

  if (getEngineMode() !== "hybrid") return result;

  try {
    const ai = await aiService.analyzeJobMatch(resumeText, jobDescription, jobTitle);

    const known = new Set([...result.missingKeywords, ...result.matchedKeywords].map((k) => k.toLowerCase()));
    const extraMissing = ai.missingKeywords.filter((k) => !known.has(k.toLowerCase()));

    return {
      ...result,
      matchScore: clamp(ai.matchScore * AI_SHARE + localScore * (1 - AI_SHARE)),
      aiScore: ai.matchScore,
      missingKeywords: [...result.missingKeywords, ...extraMissing].slice(0, 15),
      summary: ai.summary || result.summary,
      strengthsForRole: [...result.strengthsForRole, ...ai.strengthsForRole].slice(0, 5),
      suggestions: [...ai.suggestions, ...result.suggestions].slice(0, 6),
      aiUsed: true,
      engine: "hybrid",
    };
  } catch (error) {
    console.warn("AI job match skipped:", error.message);
    return { ...result, engine: "local-fallback" };
  }
};

module.exports = { matchResumeToJob };
