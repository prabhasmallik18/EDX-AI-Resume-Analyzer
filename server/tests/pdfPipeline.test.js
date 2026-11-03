/**
 * Full pipeline with REAL PDF files: PDF -> text -> built-in analysis.
 * No database, no internet and no API key are used.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const extractText = require("../utils/pdfParser");
const { analyzeResumeLocally } = require("../services/localAnalyzer");

const fixture = (name) => path.join(__dirname, "fixtures", name);

test("reads a PDF that the old pdf-parse library used to reject", async () => {
  // pdf-parse 1.1.1 failed on this file with "bad XRef entry". pdf.js must read it.
  const text = await extractText(fixture("sample-strong-resume.pdf"));
  assert.match(text, /Aarav Sharma/);
  assert.match(text, /EXPERIENCE/);
  assert.ok(text.split(/\s+/).length > 150, "whole document should be extracted, not just the first lines");
  assert.ok(text.split("\n").length > 15, "line breaks must be kept so sections can be detected");
});

test("strong, average and weak resumes get clearly different scores", async () => {
  const score = async (name) => analyzeResumeLocally(await extractText(fixture(name)));

  const strong = await score("sample-strong-resume.pdf");
  const average = await score("sample-average-resume.pdf");
  const weak = await score("sample-weak-resume.pdf");

  assert.ok(strong.atsScore >= 85, `strong was ${strong.atsScore}`);
  assert.ok(average.atsScore >= 35 && average.atsScore <= 70, `average was ${average.atsScore}`);
  assert.ok(weak.atsScore <= 25, `weak was ${weak.atsScore}`);
  assert.ok(strong.atsScore > average.atsScore + 15);
  assert.ok(average.atsScore > weak.atsScore + 15);

  assert.equal(strong.insights.role, "Full Stack Developer");
  assert.ok(strong.insights.sectionsFound.includes("Projects"));
  assert.ok(average.weaknesses.some((w) => /weak phrases/.test(w)));
  assert.ok(weak.weaknesses.some((w) => /email/i.test(w)));
});

test("the same resume always gives exactly the same result", async () => {
  const text = await extractText(fixture("sample-average-resume.pdf"));
  assert.deepEqual(analyzeResumeLocally(text), analyzeResumeLocally(text));
});

test("an image-only or empty PDF gives a clear 400 error", async () => {
  const fs = require("node:fs");
  const os = require("node:os");
  const broken = path.join(os.tmpdir(), `broken-${Date.now()}.pdf`);
  fs.writeFileSync(broken, "%PDF-1.4\nthis is not really a pdf");

  try {
    await assert.rejects(extractText(broken), (error) => error.statusCode === 400);
  } finally {
    fs.unlinkSync(broken);
  }
});

test("many PDFs read at the same time never get mixed up", async () => {
  const names = ["strong", "average", "weak"];
  const markers = { strong: "Aarav Sharma", average: "Priya Nair", weak: "Ramesh Kumar" };

  // 30 reads at once, in a shuffled order, like several users uploading together.
  const jobs = Array.from({ length: 30 }, (_, i) => names[(i * 7) % 3]);

  const results = await Promise.all(
    jobs.map(async (name) => ({
      name,
      text: await extractText(fixture(`sample-${name}-resume.pdf`)),
    }))
  );

  for (const { name, text } of results) {
    assert.match(text, new RegExp(markers[name]), `${name} resume returned the wrong text`);
    for (const other of names.filter((n) => n !== name)) {
      assert.doesNotMatch(text, new RegExp(markers[other]), `${name} resume leaked ${other} text`);
    }
  }
});
