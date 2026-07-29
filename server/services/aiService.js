const { GoogleGenAI } = require("@google/genai");
const buildResumePrompt = require("../utils/promptBuilder");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const analyzeResume = async (resumeText) => {
  const prompt = buildResumePrompt(resumeText);

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });
  const rawResponse = response.text;

  console.log("RAW RESPONSE:", rawResponse);

  const cleanedResponse = rawResponse
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const parsedResponse = JSON.parse(cleanedResponse);

  if (
    typeof parsedResponse.atsScore !== "number" ||
    !Array.isArray(parsedResponse.skills) ||
    !Array.isArray(parsedResponse.suggestions)
  ) {
    throw new Error("Invalid AI response format.");
  }

  return parsedResponse;
};

module.exports = {
  analyzeResume,
};
