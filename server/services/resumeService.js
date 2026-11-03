const crypto = require("crypto");
const fs = require("fs").promises;
const path = require("path");

const Resume = require("../models/Resume");
const extractedTextFromPDF = require("../utils/pdfParser");
const { analyzeResume } = require("./analysisService");

const buildResumeHash = (text) => {
  const normalizedText = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  return crypto.createHash("sha256").update(normalizedText).digest("hex");
};

// Every real PDF starts with the five characters "%PDF-". Anything else is a renamed file.
const assertRealPdf = async (filePath) => {
  const handle = await fs.open(filePath, "r");

  try {
    const { buffer } = await handle.read(Buffer.alloc(5), 0, 5, 0);

    if (buffer.toString("latin1") !== "%PDF-") {
      throw userError("This file is not a valid PDF.");
    }
  } finally {
    await handle.close();
  }
};

const removeFile = (filePath) => fs.unlink(filePath).catch(() => {});

// An error that is the user's fault (wrong file) should answer 400, not 500.
const userError = (message) => Object.assign(new Error(message), { statusCode: 400 });

const createResume = async (file, userId) => {
  if (!file) {
    throw userError("Please attach a PDF file in the 'resume' field.");
  }

  try {
    await assertRealPdf(file.path);

    const extractedText = await extractedTextFromPDF(file.path);

    if (!extractedText || !extractedText.trim()) {
      throw userError("Could not extract readable text from this PDF.");
    }

    const resumeHash = buildResumeHash(extractedText);

    const existingResume = await Resume.findOne({
      user: userId,
      resumeHash,
    }).sort({ createdAt: -1 });

    if (existingResume) {
      await removeFile(file.path);
      return existingResume;
    }

    const aiResponse = await analyzeResume(extractedText);

    const resume = await Resume.create({
      user: userId,
      originalName: file.originalname,
      fileName: file.filename,
      // Saved relative to the server folder so deleting later works on every computer.
      filePath: path.join("uploads", file.filename),
      fileSize: file.size,
      resumeHash,
      extractedText,
      analysisStatus: "Completed",
      atsScore: aiResponse.atsScore,
      scoreBreakdown: aiResponse.scoreBreakdown,
      engine: aiResponse.engine,
      insights: aiResponse.insights,
      skills: aiResponse.skills,
      missingSkills: aiResponse.missingSkills,
      strengths: aiResponse.strengths,
      weaknesses: aiResponse.weaknesses,
      suggestions: aiResponse.suggestions,
    });

    return resume;
  } catch (error) {
    // The analysis failed, so do not leave an orphan PDF lying in the uploads folder.
    await removeFile(file.path);
    throw error;
  }
};

module.exports = {
  createResume,
};
