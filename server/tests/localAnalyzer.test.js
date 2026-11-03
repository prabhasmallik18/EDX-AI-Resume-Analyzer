const test = require("node:test");
const assert = require("node:assert/strict");

const { analyzeResumeLocally, splitIntoSections } = require("../services/localAnalyzer");
const { cosineSimilarity } = require("../utils/textSimilarity");
const { detectRole } = require("../utils/roleProfiles");

const GOOD = `PRABHAS MALLIK
prabhas@example.com | +91 98765 43210 | linkedin.com/in/prabhas | github.com/prabhas
SUMMARY
Full stack developer intern skilled in React, Node.js and MongoDB, building scalable web apps.
SKILLS
JavaScript, TypeScript, React, Node.js, Express.js, MongoDB, SQL, HTML, CSS, Git, Docker, REST APIs, JWT
PROJECTS
AI Resume Analyzer
• Built a full stack resume analysis platform using React, Node.js, Express and MongoDB serving 200+ users
• Designed REST API with JWT authentication and reduced response time by 40% using caching
• Implemented rate limiting and input validation that blocked 100% of malformed uploads in testing
E-Commerce Store
• Developed a shopping cart with Redux and Stripe handling 50 test orders per day
• Deployed the app on Vercel and configured CI/CD with GitHub Actions
EXPERIENCE
Web Development Intern, EDX Technologies, Jun 2026 - Aug 2026
• Created 12 reusable React components that cut development time by 30%
• Collaborated with 4 engineers to ship 3 features using Agile and Jira
• Wrote unit tests with Jest improving coverage from 40% to 78%
EDUCATION
B.Tech Computer Science, ABC University, 2023 - 2027
CERTIFICATIONS
Meta Front-End Developer Certificate, 2025`;

const WEAK = `Ramesh Kumar
I am a hard working student looking for a job.
I know computers and some programming.
Responsible for helping in college projects.
Worked on a website with my friends.
Hobbies: cricket, music, travelling`;

test("a strong resume scores high, a weak one scores low", () => {
  const good = analyzeResumeLocally(GOOD);
  const weak = analyzeResumeLocally(WEAK);
  assert.ok(good.atsScore >= 80, `good scored ${good.atsScore}`);
  assert.ok(weak.atsScore <= 25, `weak scored ${weak.atsScore}`);
  assert.ok(good.atsScore - weak.atsScore > 50);
});

test("same resume always gives exactly the same result (deterministic)", () => {
  assert.deepEqual(analyzeResumeLocally(GOOD), analyzeResumeLocally(GOOD));
});

test("output has the same shape the app already expects", () => {
  const r = analyzeResumeLocally(GOOD);
  assert.ok(Number.isInteger(r.atsScore) && r.atsScore >= 1 && r.atsScore <= 100);
  for (const key of ["keywords", "skills", "impact", "structure", "formatting"]) {
    assert.ok(r.scoreBreakdown[key] >= 0 && r.scoreBreakdown[key] <= 100, key);
  }
  for (const key of ["skills", "missingSkills", "strengths", "weaknesses", "suggestions"]) {
    assert.ok(Array.isArray(r[key]) && r[key].length <= 12, key);
  }
  assert.equal(r.insights.role, "Full Stack Developer");
});

test("finds sections, contact details and measurable bullets", () => {
  const { insights } = analyzeResumeLocally(GOOD);
  assert.deepEqual(
    insights.sectionsFound.sort(),
    ["Certifications", "Education", "Experience", "Projects", "Skills", "Summary"]
  );
  assert.ok(insights.contact.email && insights.contact.phone && insights.contact.linkedin && insights.contact.github);
  assert.ok(insights.quantifiedBullets >= 6, `quantified ${insights.quantifiedBullets}`);
  assert.ok(insights.actionVerbBullets >= 7);
});

test("a normal sentence is not mistaken for a section heading", () => {
  const { found } = splitIntoSections("Skills\nReact\nExperience with React and Node.js\nProjects completed in college");
  assert.deepEqual(found, ["skills"]);
});

test("weak phrases and missing links produce specific feedback", () => {
  const r = analyzeResumeLocally(WEAK);
  const text = [...r.weaknesses, ...r.suggestions].join(" ");
  assert.match(text, /weak phrases/);
  assert.match(text, /LinkedIn or GitHub/);
  assert.match(text, /No email/);
  assert.match(text, /Responsible for helping/);
});

test("years and months in dates do not count as measurable results", () => {
  const r = analyzeResumeLocally(
    "SKILLS\nReact\nEXPERIENCE\n• Worked at Acme Corp from Jan 2024 to March 2025 on internal tools\n• Maintained the company website during 2024 and 2025 for staff"
  );
  assert.equal(r.insights.quantifiedBullets, 0);
});

test("empty and garbage text do not crash", () => {
  assert.ok(analyzeResumeLocally("").atsScore <= 15);
  assert.ok(analyzeResumeLocally("\u0000\u0001 ### !!!").atsScore >= 1);
});

test("role detection picks the closest profile, else General", () => {
  assert.equal(detectRole(["Python", "Pandas", "NumPy", "Machine Learning", "SQL"]).role, "Data / ML Engineer");
  assert.equal(detectRole(["Communication"]).role, "General Professional");
});

test("cosine similarity: identical = 1, unrelated = 0, related in between", () => {
  const a = "react node mongodb developer building rest apis";
  assert.ok(Math.abs(cosineSimilarity(a, a) - 1) < 1e-9);
  assert.equal(cosineSimilarity(a, "painting cooking gardening hobbies"), 0);
  const related = cosineSimilarity(a, "we need a developer with react and rest apis");
  assert.ok(related > 0.2 && related < 1);
  assert.equal(cosineSimilarity("", a), 0);
});
