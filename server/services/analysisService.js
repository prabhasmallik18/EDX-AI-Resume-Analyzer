const { analyzeResumeLocally } = require("./localAnalyzer");
const aiService = require("./aiService");

/**
 * Which engine analyses the resume?
 *   local  (default) - our own rule-based engine. No API key, no internet, always the same result.
 *   hybrid           - same score from our engine, PLUS extra written advice from Gemini.
 * Set it in server/.env:  ANALYSIS_ENGINE=local   or   ANALYSIS_ENGINE=hybrid
 */
const getEngineMode = () =>
  String(process.env.ANALYSIS_ENGINE || "local").trim().toLowerCase() === "hybrid" ? "hybrid" : "local";

const key = (text) => String(text).trim().toLowerCase();

// Our own findings first (they contain exact numbers), then the AI's extra points. No duplicates.
const blend = (own, extra, max) => {
  const seen = new Set();
  return [...own.slice(0, 5), ...own.slice(5), ...extra]
    .filter((item) => {
      const k = key(item);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, max);
};

const analyzeResume = async (resumeText) => {
  const local = analyzeResumeLocally(resumeText);

  if (getEngineMode() !== "hybrid") {
    return { ...local, engine: "local" };
  }

  try {
    const ai = await aiService.analyzeResume(resumeText);

    return {
      ...local, // score + breakdown stay deterministic
      skills: blend(local.skills, ai.skills, 12),
      missingSkills: blend(local.missingSkills, ai.missingSkills, 8),
      strengths: blend(local.strengths, ai.strengths, 8),
      weaknesses: blend(local.weaknesses, ai.weaknesses, 8),
      suggestions: blend(local.suggestions, ai.suggestions, 8),
      engine: "hybrid",
    };
  } catch (error) {
    // The AI is only a bonus. If it fails, the user still gets the full local report.
    console.warn("AI enhancement skipped:", error.message);
    return { ...local, engine: "local" };
  }
};

module.exports = { analyzeResume, getEngineMode };
