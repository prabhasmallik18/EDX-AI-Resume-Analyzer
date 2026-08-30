const { GoogleGenAI } = require("@google/genai");
const buildResumePrompt = require("../utils/promptBuilder");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

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

const normalizeArray = (value) =>
  Array.isArray(value)
    ? value
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 8)
    : [];

const analyzeResume = async (resumeText) => {
  if (!resumeText || !resumeText.trim()) {
    throw new Error("Resume text is empty and cannot be analyzed.");
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "AI service is not configured. Add GEMINI_API_KEY to the server environment."
    );
  }

  const prompt = buildResumePrompt(resumeText);

  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
      contents: prompt,
    });

    const parsedResponse = parseAIResponse(response?.text);
    const atsScore = Number(parsedResponse.atsScore);

    if (!Number.isFinite(atsScore) || atsScore < 1 || atsScore > 100) {
      throw new Error("AI returned an invalid ATS score.");
    }

    const result = {
      atsScore: Math.round(atsScore),
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

module.exports = {
  analyzeResume,
};
