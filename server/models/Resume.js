const mongoose = require("mongoose");

// The 5 small scores shown under the main ATS score.
const scoreBreakdownSchema = new mongoose.Schema(
  {
    keywords: { type: Number, min: 0, max: 100, default: null },
    formatting: { type: Number, min: 0, max: 100, default: null },
    impact: { type: Number, min: 0, max: 100, default: null },
    skills: { type: Number, min: 0, max: 100, default: null },
    structure: { type: Number, min: 0, max: 100, default: null },
  },
  { _id: false }
);

// One result of "match this resume to a job description".
const jobMatchSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, trim: true, maxlength: 120, default: "" },
    company: { type: String, trim: true, maxlength: 120, default: "" },
    jobDescription: { type: String, required: true, maxlength: 8000 },
    matchScore: { type: Number, min: 0, max: 100, required: true },
    keywordScore: { type: Number, min: 0, max: 100, default: 0 },
    aiScore: { type: Number, min: 0, max: 100, default: null },
    similarityScore: { type: Number, min: 0, max: 100, default: null },
    engine: { type: String, enum: ["local", "hybrid", "local-fallback"], default: "local" },
    matchedKeywords: { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },
    summary: { type: String, default: "" },
    strengthsForRole: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
    aiUsed: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: String,
      required: true,
    },
    resumeHash: {
      type: String,
      default: null,
    },
    extractedText: {
      type: String,
      default: "",
    },
    analysisStatus: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Failed"],
      default: "Pending",
    },
    atsScore: {
      type: Number,
      default: null,
    },
    scoreBreakdown: {
      type: scoreBreakdownSchema,
      default: null,
    },
    skills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    suggestions: {
      type: [String],
      default: [],
    },
    // "local" = our own engine, "hybrid" = our engine + Gemini advice. Old resumes: null.
    engine: {
      type: String,
      enum: ["local", "hybrid", "gemini", null],
      default: null,
    },
    // The evidence behind the scores (word count, bullets with numbers, sections found...).
    insights: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    jobMatches: {
      type: [jobMatchSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

resumeSchema.index(
  { user: 1, resumeHash: 1 },
  { unique: true, sparse: true }
);

const Resume = mongoose.model("Resume", resumeSchema);

module.exports = Resume;
