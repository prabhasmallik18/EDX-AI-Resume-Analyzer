const test = require("node:test");
const assert = require("node:assert/strict");

const aiService = require("../services/aiService");
const { analyzeResume } = require("../services/analysisService");

const RESUME = `Asha Rao
asha@example.com +91 90000 11111 github.com/asha
SKILLS
Python, SQL, Pandas, NumPy, Machine Learning, Git
PROJECTS
• Built a churn model with scikit-learn reaching 91% accuracy on 20000 records
EDUCATION
B.Sc Statistics 2024`;

test("default mode is local and never calls Gemini", async () => {
  delete process.env.ANALYSIS_ENGINE;
  const original = aiService.analyzeResume;
  aiService.analyzeResume = async () => {
    throw new Error("must not be called");
  };
  try {
    const result = await analyzeResume(RESUME);
    assert.equal(result.engine, "local");
    assert.ok(result.atsScore >= 1);
  } finally {
    aiService.analyzeResume = original;
  }
});

test("hybrid mode keeps OUR score and adds the AI's advice", async () => {
  const original = aiService.analyzeResume;
  aiService.analyzeResume = async () => ({
    atsScore: 12,
    skills: ["Statistics"],
    missingSkills: ["Spark"],
    strengths: ["AI-written strength"],
    weaknesses: ["AI-written weakness"],
    suggestions: ["AI-written suggestion"],
  });
  try {
    delete process.env.ANALYSIS_ENGINE;
    const local = await analyzeResume(RESUME);

    process.env.ANALYSIS_ENGINE = "hybrid";
    const hybrid = await analyzeResume(RESUME);

    assert.equal(hybrid.engine, "hybrid");
    assert.equal(hybrid.atsScore, local.atsScore, "score must stay deterministic");
    assert.ok(hybrid.strengths.includes("AI-written strength"));
    assert.ok(hybrid.suggestions.includes("AI-written suggestion"));
    assert.ok(hybrid.skills.includes("Statistics"));
  } finally {
    delete process.env.ANALYSIS_ENGINE;
    aiService.analyzeResume = original;
  }
});

test("hybrid mode survives an AI failure", async () => {
  const original = aiService.analyzeResume;
  aiService.analyzeResume = async () => {
    throw new Error("quota exceeded");
  };
  try {
    process.env.ANALYSIS_ENGINE = "hybrid";
    const result = await analyzeResume(RESUME);
    assert.equal(result.engine, "local");
    assert.ok(result.atsScore >= 1);
  } finally {
    delete process.env.ANALYSIS_ENGINE;
    aiService.analyzeResume = original;
  }
});
