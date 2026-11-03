const { buildResumePrompt, buildJobMatchPrompt } = require("../utils/promptBuilder");

// The Gemini client is created only when first needed, so the app runs fine without a key.
let client = null;
const getClient = () => {
  if (!client) {
    const { GoogleGenAI } = require("@google/genai");
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
};

const MODEL = () => process.env.GEMINI_MODEL || "gemini-3.6-flash";

const parseAIResponse = (rawResponse) => {
  const cleanedResponse = String(rawResponse || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleanedResponse);
  } catch {
    const start = cleanedResponse.indexOf("{");
    const end = cleanedResponse.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw new Error("AI returned an invalid response.");
    }

    try {
      return JSON.parse(cleanedResponse.slice(start, end + 1));
    } catch {
      throw new Error("AI returned an invalid response.");
    }
  }
};

const normalizeArray = (value, max = 8) =>
  Array.isArray(value)
    ? value
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, max)
    : [];

// Turn any value into a whole number between 0 and 100, or null if it is not a number.
const toPercent = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.min(100, Math.max(0, Math.round(number)));
};

const normalizeBreakdown = (value) => {
  if (!value || typeof value !== "object") return null;

  const breakdown = {
    keywords: toPercent(value.keywords),
    formatting: toPercent(value.formatting),
    impact: toPercent(value.impact),
    skills: toPercent(value.skills),
    structure: toPercent(value.structure),
  };

  // If the AI gave us nothing usable, do not store an empty object.
  return Object.values(breakdown).every((v) => v === null) ? null : breakdown;
};

const assertConfigured = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "AI service is not configured. Add GEMINI_API_KEY to the server environment."
    );
  }
};

// Gemini sometimes answers "503 overloaded" or "429 too many requests" for a few seconds.
// Waiting a moment and trying again fixes most of these.
const isTemporaryError = (error) =>
  /429|503|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|timeout|ECONNRESET/i.test(
    `${error?.status || ""} ${error?.message || ""}`
  );

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const askGemini = async (prompt, { retries = 2, retryDelayMs = 1500 } = {}) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await getClient().models.generateContent({
        model: MODEL(),
        contents: prompt,
        config: {
          temperature: 0,
          candidateCount: 1,
          responseMimeType: "application/json",
        },
      });

      return parseAIResponse(response?.text);
    } catch (error) {
      lastError = error;

      if (attempt === retries || !isTemporaryError(error)) break;

      await sleep(retryDelayMs * (attempt + 1));
    }
  }

  throw lastError;
};

const analyzeResume = async (resumeText) => {
  if (!resumeText || !resumeText.trim()) {
    throw new Error("Resume text is empty and cannot be analyzed.");
  }

  assertConfigured();

  try {
    const parsedResponse = await askGemini(buildResumePrompt(resumeText));
    const atsScore = Number(parsedResponse.atsScore);

    if (!Number.isFinite(atsScore) || atsScore < 1 || atsScore > 100) {
      throw new Error("AI returned an invalid ATS score.");
    }

    const result = {
      atsScore: Math.round(atsScore),
      scoreBreakdown: normalizeBreakdown(parsedResponse.scoreBreakdown),
      skills: normalizeArray(parsedResponse.skills),
      missingSkills: normalizeArray(parsedResponse.missingSkills),
      strengths: normalizeArray(parsedResponse.strengths),
      weaknesses: normalizeArray(parsedResponse.weaknesses),
      suggestions: normalizeArray(parsedResponse.suggestions),
    };

    if (result.skills.length === 0 && result.suggestions.length === 0) {
      throw new Error("AI returned an incomplete resume analysis.");
    }

    return result;
  } catch (error) {
    console.error("AI Analysis Error:", error.message);
    throw new Error(error.message || "Unable to analyze resume with AI.");
  }
};

/**
 * Ask the AI how well a resume fits one job description.
 * Returns { matchScore, summary, missingKeywords, strengthsForRole, suggestions }.
 */
const analyzeJobMatch = async (resumeText, jobDescription, jobTitle = "") => {
  assertConfigured();

  try {
    const parsed = await askGemini(
      buildJobMatchPrompt(resumeText, jobDescription, jobTitle)
    );

    const matchScore = toPercent(parsed.matchScore);

    if (matchScore === null) {
      throw new Error("AI returned an invalid match score.");
    }

    return {
      matchScore,
      summary: typeof parsed.summary === "string" ? parsed.summary.trim().slice(0, 800) : "",
      missingKeywords: normalizeArray(parsed.missingKeywords, 10),
      strengthsForRole: normalizeArray(parsed.strengthsForRole, 5),
      suggestions: normalizeArray(parsed.suggestions, 6),
    };
  } catch (error) {
    console.error("AI Job Match Error:", error.message);
    throw new Error(error.message || "Unable to match resume with AI.");
  }
};

module.exports = {
  analyzeResume,
  analyzeJobMatch,
  // exported for unit tests
  parseAIResponse,
  normalizeBreakdown,
};
