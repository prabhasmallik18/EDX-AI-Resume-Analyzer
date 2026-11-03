const test = require("node:test");
const assert = require("node:assert/strict");

const { parseAIResponse, normalizeBreakdown } = require("../services/aiService");
const { buildJobMatchPrompt, buildResumePrompt } = require("../utils/promptBuilder");

test("parseAIResponse accepts plain JSON, fenced JSON and JSON with chatter", () => {
  assert.deepEqual(parseAIResponse('{"a":1}'), { a: 1 });
  assert.deepEqual(parseAIResponse('```json\n{"a":1}\n```'), { a: 1 });
  assert.deepEqual(parseAIResponse('Sure! Here it is: {"a":1} Hope it helps'), { a: 1 });
  assert.throws(() => parseAIResponse("no json at all"), /invalid response/);
});

test("normalizeBreakdown clamps values and drops garbage", () => {
  assert.deepEqual(
    normalizeBreakdown({ keywords: 120, formatting: -5, impact: "70", skills: "abc", structure: 55.6 }),
    { keywords: 100, formatting: 0, impact: 70, skills: null, structure: 56 }
  );
  assert.equal(normalizeBreakdown(null), null);
  assert.equal(normalizeBreakdown({ keywords: "x" }), null);
});

test("prompts cap very long text and warn the AI about injected instructions", () => {
  const huge = "x".repeat(100000);
  assert.ok(buildResumePrompt(huge).length < 25000);
  const prompt = buildJobMatchPrompt("my resume", huge, "Engineer");
  assert.ok(prompt.length < 35000);
  assert.match(prompt, /untrusted data/);
  assert.match(prompt, /Target job title: Engineer/);
});
