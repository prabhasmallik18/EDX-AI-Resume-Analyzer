const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const Resume = require("../models/Resume");
const { createResume } = require("../services/resumeService");
const { matchResumeToJob } = require("../services/jobMatchService");
const { analyzeResume } = require("../services/analysisService");
const { UPLOAD_DIR } = require("../middleware/uploadMiddleware");
const { MAX_JD_CHARS } = require("../utils/promptBuilder");

const MIN_JD_CHARS = 50;
const MAX_MATCHES_PER_RESUME = 10;

const buildResumeHash = (text) => {
  const normalizedText = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  return crypto.createHash("sha256").update(normalizedText).digest("hex");
};

const notFound = (res) =>
  res.status(404).json({ success: false, message: "Resume not found" });

const uploadResume = async (req, res) => {
  try {
    const resume = await createResume(req.file, req.user.userId);
    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      data: resume,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({
      user: req.user.userId,
    }).sort({ createdAt: -1 });

    const uniqueResumes = [];
    const seenHashes = new Set();

    for (const resume of resumes) {
      const hash = resume.resumeHash || buildResumeHash(resume.extractedText);

      if (seenHashes.has(hash)) {
        continue;
      }

      seenHashes.add(hash);
      uniqueResumes.push(resume);
    }

    res.status(200).json({
      success: true,
      count: uniqueResumes.length,
      data: uniqueResumes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getResumeById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return notFound(res);
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!resume) {
      return notFound(res);
    }

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    console.error("Get Resume Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteResume = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return notFound(res);
    }

    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return notFound(res);
    }

    if (resume.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Only ever delete files that really live inside the uploads folder.
    const filePath = path.resolve(__dirname, "..", resume.filePath);

    if (filePath.startsWith(UPLOAD_DIR + path.sep) && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Resume.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Resume deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/resume/:id/reanalyze
 * Runs the analysis again on the text we already saved (no new upload needed).
 * Useful for resumes that were analysed by an older engine.
 */
const reanalyzeResume = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return notFound(res);
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!resume) {
      return notFound(res);
    }

    if (!resume.extractedText?.trim()) {
      return res.status(400).json({
        success: false,
        message: "This resume has no readable text to analyse.",
      });
    }

    const result = await analyzeResume(resume.extractedText);

    resume.atsScore = result.atsScore;
    resume.scoreBreakdown = result.scoreBreakdown;
    resume.engine = result.engine;
    resume.insights = result.insights;
    resume.skills = result.skills;
    resume.missingSkills = result.missingSkills;
    resume.strengths = result.strengths;
    resume.weaknesses = result.weaknesses;
    resume.suggestions = result.suggestions;
    resume.analysisStatus = "Completed";

    await resume.save();

    res.status(200).json({
      success: true,
      message: "Resume analysed again.",
      data: resume,
    });
  } catch (error) {
    console.error("Reanalyze Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Unable to analyse this resume right now.",
    });
  }
};

/**
 * POST /api/resume/:id/match
 * Body: { jobDescription, jobTitle?, company? }
 * Compares one saved resume with a pasted job description and saves the result.
 */
const matchJob = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return notFound(res);
    }

    const jobDescription = String(req.body?.jobDescription || "").trim();
    const jobTitle = String(req.body?.jobTitle || "").trim().slice(0, 120);
    const company = String(req.body?.company || "").trim().slice(0, 120);

    if (jobDescription.length < MIN_JD_CHARS) {
      return res.status(400).json({
        success: false,
        message: `Please paste a fuller job description (at least ${MIN_JD_CHARS} characters).`,
      });
    }

    if (jobDescription.length > MAX_JD_CHARS) {
      return res.status(400).json({
        success: false,
        message: `Job description is too long. Keep it under ${MAX_JD_CHARS} characters.`,
      });
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!resume) {
      return notFound(res);
    }

    if (!resume.extractedText?.trim()) {
      return res.status(400).json({
        success: false,
        message: "This resume has no readable text to compare.",
      });
    }

    const result = await matchResumeToJob(resume.extractedText, jobDescription, jobTitle);

    resume.jobMatches.push({
      jobTitle,
      company,
      jobDescription,
      matchScore: result.matchScore,
      keywordScore: result.keywordScore,
      aiScore: result.aiScore,
      similarityScore: result.similarityScore,
      engine: result.engine,
      matchedKeywords: result.matchedKeywords,
      missingKeywords: result.missingKeywords,
      summary: result.summary,
      strengthsForRole: result.strengthsForRole,
      suggestions: result.suggestions,
      aiUsed: result.aiUsed,
    });

    // Keep only the newest matches so one document never grows without limit.
    if (resume.jobMatches.length > MAX_MATCHES_PER_RESUME) {
      resume.jobMatches.splice(0, resume.jobMatches.length - MAX_MATCHES_PER_RESUME);
    }

    await resume.save();

    res.status(201).json({
      success: true,
      message:
        result.engine === "local-fallback"
          ? "Job match completed with the built-in engine only (AI is unavailable right now)."
          : "Job match completed.",
      data: resume.jobMatches[resume.jobMatches.length - 1],
    });
  } catch (error) {
    console.error("Job Match Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Unable to match this resume right now.",
    });
  }
};

/**
 * GET /api/resume/stats
 * Small summary for the dashboard (numbers + score trend), without sending resume text.
 */
const getStats = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.userId })
      .select("originalName atsScore analysisStatus createdAt jobMatches.matchScore")
      .sort({ createdAt: 1 })
      .lean();

    const completed = resumes.filter(
      (resume) =>
        resume.analysisStatus === "Completed" && Number.isFinite(resume.atsScore)
    );

    const scores = completed.map((resume) => resume.atsScore);
    const matchScores = resumes.flatMap((resume) =>
      (resume.jobMatches || []).map((match) => match.matchScore)
    );

    const average = (values) =>
      values.length
        ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
        : null;

    res.status(200).json({
      success: true,
      data: {
        totalResumes: resumes.length,
        averageScore: average(scores),
        bestScore: scores.length ? Math.max(...scores) : null,
        latestScore: scores.length ? scores[scores.length - 1] : null,
        // positive number = the newest resume scores higher than the first one
        improvement: scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0,
        totalJobMatches: matchScores.length,
        averageMatchScore: average(matchScores),
        trend: completed.map((resume) => ({
          id: resume._id,
          name: resume.originalName,
          score: resume.atsScore,
          date: resume.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Stats Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load dashboard statistics.",
    });
  }
};

module.exports = {
  uploadResume,
  getMyResumes,
  deleteResume,
  getResumeById,
  matchJob,
  reanalyzeResume,
  getStats,
};
