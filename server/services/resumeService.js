const crypto = require("crypto");
const fs = require("fs").promises;

const Resume = require("../models/Resume");
const extractedTextFromPDF = require("../utils/pdfParser");
const { analyzeResume } = require("./aiService");

const buildResumeHash = (text) => {
  const normalizedText = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  return crypto.createHash("sha256").update(normalizedText).digest("hex");
};

const createResume = async (file, userId) => {
  const extractedText = await extractedTextFromPDF(file.path);

  if (!extractedText || !extractedText.trim()) {
    throw new Error("Could not extract readable text from this PDF.");
  }

  const resumeHash = buildResumeHash(extractedText);

  const existingResume = await Resume.findOne({
    user: userId,
    resumeHash,
  }).sort({ createdAt: -1 });

  if (existingResume) {
    await fs.unlink(file.path).catch(() => {});
    return existingResume;
  }

  const aiResponse = await analyzeResume(extractedText);

  const resume = await Resume.create({
    user: userId,
    originalName: file.originalname,
    fileName: file.filename,
    filePath: file.path,
    fileSize: file.size,
    resumeHash,
    extractedText,
    analysisStatus: "Completed",
    atsScore: aiResponse.atsScore,
    skills: aiResponse.skills,
    missingSkills: aiResponse.missingSkills,
    strengths: aiResponse.strengths,
    weaknesses: aiResponse.weaknesses,
    suggestions: aiResponse.suggestions,
  });

  return resume;
};

module.exports = {
  createResume,
};
