const test = require("node:test");
const assert = require("node:assert/strict");

const { matchKeywords, findSkills } = require("../utils/keywordMatcher");

test("finds skills and understands other spellings", () => {
  const skills = findSkills("Built apps with ReactJS, nodejs and Postgres. Used k8s and CI/CD.");
  for (const expected of ["React", "Node.js", "PostgreSQL", "Kubernetes", "CI/CD"]) {
    assert.ok(skills.includes(expected), `expected ${expected} in ${skills}`);
  }
});

test("java is not found inside javascript", () => {
  const skills = findSkills("I know JavaScript very well.");
  assert.ok(skills.includes("JavaScript"));
  assert.ok(!skills.includes("Java"));
});

test("c++ and c# are found with their symbols", () => {
  const skills = findSkills("Languages: C++, C#, Python.");
  assert.ok(skills.includes("C++"));
  assert.ok(skills.includes("C#"));
});

test("normal English words are not mistaken for skills", () => {
  const skills = findSkills("Go above and beyond. Excel at teamwork. The rest of the team enjoys spring.");
  assert.ok(!skills.includes("Go"));
  assert.ok(!skills.includes("Excel"));
  assert.ok(!skills.includes("Spring"));
  assert.ok(!skills.includes("REST API"));
});

test("scores matched vs missing keywords", () => {
  const result = matchKeywords(
    "React, Node.js, MongoDB and Docker projects.",
    "We need React, Node.js, MongoDB, Docker, AWS, TypeScript, Kubernetes and Git."
  );
  assert.equal(result.mode, "skills");
  assert.equal(result.totalKeywords, 8);
  assert.deepEqual(result.matchedKeywords.sort(), ["Docker", "MongoDB", "Node.js", "React"]);
  assert.deepEqual(result.missingKeywords.sort(), ["AWS", "Git", "Kubernetes", "TypeScript"]);
  assert.equal(result.keywordScore, 50);
});

test("perfect and zero matches", () => {
  const jd = "Looking for Python, SQL and Docker experience.";
  assert.equal(matchKeywords("Python SQL Docker", jd).keywordScore, 100);
  assert.equal(matchKeywords("Painting and cooking", jd).keywordScore, 0);
});

test("non-technical job falls back to repeated words", () => {
  const jd =
    "Nursing role. Patient care, patient safety and patient records. Hospital ward experience, ward rounds, hospital policy.";
  const result = matchKeywords("Registered nurse with hospital and patient care background.", jd);
  assert.equal(result.mode, "frequency");
  assert.ok(result.matchedKeywords.includes("patient"));
  assert.ok(result.matchedKeywords.includes("hospital"));
  assert.ok(result.missingKeywords.includes("ward"));
});

test("empty input does not crash", () => {
  const result = matchKeywords("", "");
  assert.equal(result.keywordScore, 0);
  assert.equal(result.totalKeywords, 0);
});
