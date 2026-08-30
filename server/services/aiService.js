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

    return JSON.parse(cleanedResponse.slice(start, end + 1));
  }
};

const normalizeArray = (value) =>
  Array.isArray(value)
    ? value
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const analyzeResume = async (resumeText) => {
  if (!resumeText || !resumeText.trim()) {
    throw new Error("Resume text is empty and cannot be analyzed.");
  }

  const prompt = buildResumePrompt(resumeText);

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  const parsedResponse = parseAIResponse(response.text);

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
};

module.exports = {
  analyzeResume,
};
