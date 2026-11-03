/**
 * API tests. They run the REAL Express app and the REAL Mongoose schema,
 * but replace the database calls and the AI call with fakes, so no MongoDB
 * server and no Gemini key are needed.
 */
process.env.JWT_SECRET = "test-secret";
process.env.NODE_ENV = "test";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = require("../app");
const Resume = require("../models/Resume");
const aiService = require("../services/aiService");
const { matchResumeToJob } = require("../services/jobMatchService");
const { UPLOAD_DIR } = require("../middleware/uploadMiddleware");

const USER_ID = new mongoose.Types.ObjectId().toString();
const token = jwt.sign({ userId: USER_ID, email: "t@t.com" }, process.env.JWT_SECRET);
const auth = { Authorization: `Bearer ${token}` };

let server;
let base;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => resolve());
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => server.close());

const call = async (method, url, { body, headers = {} } = {}) => {
  const response = await fetch(base + url, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await response.json();
  } catch {
    // some responses have no JSON body
  }
  return { status: response.status, json, headers: response.headers };
};

const makeResume = () =>
  new Resume({
    user: USER_ID,
    originalName: "me.pdf",
    fileName: "x.pdf",
    filePath: "uploads/x.pdf",
    fileSize: "1000",
    extractedText: "Full stack developer. React, Node.js, MongoDB, Docker, Git, REST APIs.",
    analysisStatus: "Completed",
    atsScore: 70,
  });

const JD =
  "We are hiring a full stack developer. You will use React, Node.js, MongoDB, AWS, TypeScript and Docker every day.";

test("security headers are on and x-powered-by is hidden", async () => {
  const { headers } = await call("GET", "/api/auth");
  assert.equal(headers.get("x-content-type-options"), "nosniff");
  assert.equal(headers.get("x-powered-by"), null);
  assert.ok(headers.get("ratelimit") || headers.get("ratelimit-policy"), "rate limit headers expected");
});

test("protected routes reject requests without a token", async () => {
  for (const [method, url] of [
    ["GET", "/api/resume/stats"],
    ["GET", "/api/resume/my-resumes"],
    ["POST", `/api/resume/${USER_ID}/match`],
  ]) {
    const { status } = await call(method, url, method === "POST" ? { body: {} } : {});
    assert.equal(status, 401, `${method} ${url}`);
  }
});

test("malformed JSON gives 400, not 500", async () => {
  const response = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{bad json",
  });
  assert.equal(response.status, 400);
});

test("/stats is not swallowed by /:id and computes the numbers", async () => {
  const rows = [
    { _id: "a", originalName: "old.pdf", atsScore: 50, analysisStatus: "Completed", createdAt: "2026-01-01", jobMatches: [{ matchScore: 40 }] },
    { _id: "b", originalName: "new.pdf", atsScore: 80, analysisStatus: "Completed", createdAt: "2026-02-01", jobMatches: [{ matchScore: 60 }, { matchScore: 80 }] },
    { _id: "c", originalName: "bad.pdf", atsScore: null, analysisStatus: "Failed", createdAt: "2026-03-01" },
  ];
  const original = Resume.find;
  Resume.find = () => ({ select() { return this; }, sort() { return this; }, lean: async () => rows });

  try {
    const { status, json } = await call("GET", "/api/resume/stats", { headers: auth });
    assert.equal(status, 200);
    assert.equal(json.data.totalResumes, 3);
    assert.equal(json.data.averageScore, 65);
    assert.equal(json.data.bestScore, 80);
    assert.equal(json.data.latestScore, 80);
    assert.equal(json.data.improvement, 30);
    assert.equal(json.data.totalJobMatches, 3);
    assert.equal(json.data.averageMatchScore, 60);
    assert.equal(json.data.trend.length, 2);
  } finally {
    Resume.find = original;
  }
});

test("job match: rejects a too-short description and a bad id", async () => {
  const short = await call("POST", `/api/resume/${USER_ID}/match`, {
    headers: auth,
    body: { jobDescription: "too short" },
  });
  assert.equal(short.status, 400);

  const badId = await call("POST", "/api/resume/not-an-id/match", {
    headers: auth,
    body: { jobDescription: JD },
  });
  assert.equal(badId.status, 404);
});

test("job match: 404 when the resume does not belong to the user", async () => {
  const original = Resume.findOne;
  let filter;
  Resume.findOne = async (f) => {
    filter = f;
    return null;
  };

  try {
    const { status } = await call("POST", `/api/resume/${USER_ID}/match`, {
      headers: auth,
      body: { jobDescription: JD },
    });
    assert.equal(status, 404);
    assert.equal(filter.user, USER_ID, "must filter by the logged-in user");
  } finally {
    Resume.findOne = original;
  }
});

test("job match (default local engine): works with NO AI and never calls Gemini", async () => {
  const doc = makeResume();
  let saved = false;
  doc.save = async function save() {
    await this.validate(); // runs the real schema rules
    saved = true;
    return this;
  };

  const originalFind = Resume.findOne;
  const originalAI = aiService.analyzeJobMatch;
  Resume.findOne = async () => doc;
  aiService.analyzeJobMatch = async () => {
    throw new Error("Gemini must not be called in local mode");
  };
  delete process.env.ANALYSIS_ENGINE;

  try {
    const { status, json } = await call("POST", `/api/resume/${USER_ID}/match`, {
      headers: auth,
      body: { jobDescription: JD, jobTitle: "Full Stack Dev", company: "Acme" },
    });

    assert.equal(status, 201);
    assert.equal(saved, true);
    const d = json.data;
    assert.equal(d.engine, "local");
    assert.equal(d.aiUsed, false);
    assert.equal(d.aiScore, null);
    assert.ok(d.matchScore >= 0 && d.matchScore <= 100);
    assert.ok(d.similarityScore >= 0);
    assert.ok(d.matchedKeywords.includes("React"));
    assert.ok(d.missingKeywords.includes("AWS"));
    assert.ok(d.missingKeywords.includes("TypeScript"));
    assert.ok(d.summary.length > 20, "local engine writes its own summary");
    assert.ok(d.suggestions.length > 0);
    assert.equal(d.jobTitle, "Full Stack Dev");
    assert.equal(doc.jobMatches.length, 1);
    assert.doesNotMatch(json.message, /unavailable/);
  } finally {
    Resume.findOne = originalFind;
    aiService.analyzeJobMatch = originalAI;
  }
});

test("job match (hybrid): blends AI and local score, merges extra keywords", async () => {
  const doc = makeResume();
  doc.save = async function save() {
    await this.validate();
    return this;
  };

  const originalFind = Resume.findOne;
  const originalAI = aiService.analyzeJobMatch;
  Resume.findOne = async () => doc;
  aiService.analyzeJobMatch = async () => ({
    matchScore: 80,
    summary: "Good fit overall.",
    missingKeywords: ["AWS", "GraphQL"],
    strengthsForRole: ["React experience"],
    suggestions: ["Add AWS projects"],
  });

  try {
    delete process.env.ANALYSIS_ENGINE;
    const local = await matchResumeToJob(doc.extractedText, JD, "Full Stack Dev");

    process.env.ANALYSIS_ENGINE = "hybrid";
    const { status, json } = await call("POST", `/api/resume/${USER_ID}/match`, {
      headers: auth,
      body: { jobDescription: JD, jobTitle: "Full Stack Dev" },
    });

    assert.equal(status, 201);
    const d = json.data;
    assert.equal(d.engine, "hybrid");
    assert.equal(d.aiUsed, true);
    assert.equal(d.aiScore, 80);
    assert.equal(d.matchScore, Math.round(80 * 0.5 + local.matchScore * 0.5));
    assert.equal(d.summary, "Good fit overall.");
    assert.ok(d.missingKeywords.includes("GraphQL"), "AI extra keyword should be merged in");
  } finally {
    delete process.env.ANALYSIS_ENGINE;
    Resume.findOne = originalFind;
    aiService.analyzeJobMatch = originalAI;
  }
});

test("job match (hybrid): if the AI fails we fall back to the local result", async () => {
  const doc = makeResume();
  doc.save = async function save() {
    await this.validate();
    return this;
  };

  const originalFind = Resume.findOne;
  const originalAI = aiService.analyzeJobMatch;
  Resume.findOne = async () => doc;
  aiService.analyzeJobMatch = async () => {
    throw new Error("503 UNAVAILABLE");
  };

  try {
    delete process.env.ANALYSIS_ENGINE;
    const local = await matchResumeToJob(doc.extractedText, JD);

    process.env.ANALYSIS_ENGINE = "hybrid";
    const { status, json } = await call("POST", `/api/resume/${USER_ID}/match`, {
      headers: auth,
      body: { jobDescription: JD },
    });
    assert.equal(status, 201);
    assert.equal(json.data.engine, "local-fallback");
    assert.equal(json.data.aiUsed, false);
    assert.equal(json.data.matchScore, local.matchScore);
    assert.match(json.message, /built-in engine only/);
  } finally {
    delete process.env.ANALYSIS_ENGINE;
    Resume.findOne = originalFind;
    aiService.analyzeJobMatch = originalAI;
  }
});

test("job match: keeps only the 10 newest matches", async () => {
  const doc = makeResume();
  for (let i = 0; i < 10; i += 1) {
    doc.jobMatches.push({ jobTitle: `old-${i}`, jobDescription: JD, matchScore: 50 });
  }
  doc.save = async function save() {
    await this.validate();
    return this;
  };

  const originalFind = Resume.findOne;
  const originalAI = aiService.analyzeJobMatch;
  Resume.findOne = async () => doc;
  aiService.analyzeJobMatch = async () => {
    throw new Error("down");
  };

  try {
    await call("POST", `/api/resume/${USER_ID}/match`, {
      headers: auth,
      body: { jobDescription: JD, jobTitle: "newest" },
    });
    assert.equal(doc.jobMatches.length, 10);
    assert.equal(doc.jobMatches[0].jobTitle, "old-1");
    assert.equal(doc.jobMatches[9].jobTitle, "newest");
  } finally {
    Resume.findOne = originalFind;
    aiService.analyzeJobMatch = originalAI;
  }
});

test("upload: a renamed non-PDF is rejected with 400 and the file is cleaned up", async () => {
  const before = new Set(fs.readdirSync(UPLOAD_DIR));
  const form = new FormData();
  form.append("resume", new Blob(["this is just text, not a pdf"], { type: "application/pdf" }), "fake.pdf");

  const response = await fetch(`${base}/api/resume/upload`, { method: "POST", headers: auth, body: form });
  const json = await response.json();

  assert.equal(response.status, 400);
  assert.match(json.message, /not a valid PDF/);
  const leftovers = fs.readdirSync(UPLOAD_DIR).filter((f) => !before.has(f));
  assert.deepEqual(leftovers, [], "rejected file must be deleted");
});

test("upload: wrong file type and missing file are rejected", async () => {
  const form = new FormData();
  form.append("resume", new Blob(["hello"], { type: "text/plain" }), "notes.txt");
  const wrongType = await fetch(`${base}/api/resume/upload`, { method: "POST", headers: auth, body: form });
  assert.equal(wrongType.status, 400);

  const noFile = await fetch(`${base}/api/resume/upload`, { method: "POST", headers: auth, body: new FormData() });
  assert.equal(noFile.status, 400);
});

test("delete refuses to touch files outside the uploads folder", async () => {
  const victim = path.join(UPLOAD_DIR, "..", "package.json");
  assert.ok(fs.existsSync(victim));

  const doc = makeResume();
  doc.filePath = "package.json"; // pretend a tampered DB record points outside uploads
  const originalFindById = Resume.findById;
  const originalDelete = Resume.findByIdAndDelete;
  Resume.findById = async () => doc;
  Resume.findByIdAndDelete = async () => doc;

  try {
    const { status } = await call("DELETE", `/api/resume/${doc._id}`, { headers: auth });
    assert.equal(status, 200);
    assert.ok(fs.existsSync(victim), "package.json must still exist");
  } finally {
    Resume.findById = originalFindById;
    Resume.findByIdAndDelete = originalDelete;
  }
});

test("re-analyze: re-scores saved text with the built-in engine and saves it", async () => {
  const doc = makeResume();
  doc.extractedText =
    "Jane Doe\njane@mail.com | +91 99999 11111 | github.com/jane\nSKILLS\nReact, Node.js, MongoDB, Git\nPROJECTS\n- Built a chat app with React and Node.js used by 500 students\nEDUCATION\nB.Tech 2022 to 2026";
  doc.atsScore = 12; // old score from an old engine
  let saved = false;
  doc.save = async function save() {
    await this.validate();
    saved = true;
    return this;
  };

  const originalFind = Resume.findOne;
  const originalAI = aiService.analyzeResume;
  Resume.findOne = async () => doc;
  aiService.analyzeResume = async () => {
    throw new Error("Gemini must not be called in local mode");
  };
  delete process.env.ANALYSIS_ENGINE;

  try {
    const { status, json } = await call("POST", `/api/resume/${USER_ID}/reanalyze`, { headers: auth, body: {} });
    assert.equal(status, 200);
    assert.equal(saved, true);
    assert.equal(json.data.engine, "local");
    assert.notEqual(json.data.atsScore, 12);
    assert.ok(json.data.scoreBreakdown.skills >= 0);
    assert.ok(json.data.insights.wordCount > 10);

    const other = await call("POST", "/api/resume/not-an-id/reanalyze", { headers: auth, body: {} });
    assert.equal(other.status, 404);
    const anon = await call("POST", `/api/resume/${USER_ID}/reanalyze`, { body: {} });
    assert.equal(anon.status, 401);
  } finally {
    Resume.findOne = originalFind;
    aiService.analyzeResume = originalAI;
  }
});

// Keep this test LAST: it uses up the login attempts for this process.
test("login is rate limited after too many attempts", async () => {
  const statuses = [];
  for (let i = 0; i < 35; i += 1) {
    // empty body -> controller answers 400 before touching the database
    const { status } = await call("POST", "/api/auth/login", { body: {} });
    statuses.push(status);
  }
  assert.equal(statuses[0], 400);
  assert.equal(statuses[statuses.length - 1], 429);
  assert.equal(statuses.filter((s) => s === 400).length, 30);
});
