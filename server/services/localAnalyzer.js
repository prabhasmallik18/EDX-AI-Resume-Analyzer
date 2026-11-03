/**
 * Built-in resume analysis engine (no AI, no internet, no API key).
 *
 * It reads the resume text and measures 5 things with simple, explainable rules:
 *   structure  - are the key sections and contact details there?
 *   formatting - length, bullets, odd characters, merged columns
 *   impact     - numbers/results and strong action verbs in bullet points
 *   skills     - how many skills, across how many areas
 *   keywords   - how much of the job role's expected skills appear
 * The 5 scores are combined with fixed weights into the ATS score.
 * The same resume always gives exactly the same result.
 */
const { findSkills } = require("../utils/keywordMatcher");
const { detectRole, categoryOf, TECHNICAL_CATEGORIES } = require("../utils/roleProfiles");

// How much each part counts in the final ATS score (adds up to 1).
const WEIGHTS = { keywords: 0.25, skills: 0.2, impact: 0.25, structure: 0.2, formatting: 0.1 };

// A heading line must match one of these completely, e.g. "WORK EXPERIENCE" or "Projects:".
const SECTION_PATTERNS = {
  summary: /^(professional |career )?(summary|profile|objective)$|^about me$/i,
  experience: /^(work |professional |relevant )?(experience|employment|work history)( (&|and) \w+)?$|^internships?( experience)?$/i,
  projects: /^(academic |personal |key |major )?projects?$/i,
  education: /^(education|academic (background|qualifications?)|qualifications?)( (&|and) \w+)?$/i,
  skills: /^(technical |key |core )?(skills|technologies|competencies)( (&|and) \w+)?$|^tech stack$/i,
  certifications: /^(certifications?|certificates?|courses|licenses?)( (&|and) \w+)?$/i,
  achievements: /^(achievements?|awards?|honou?rs|accomplishments|extra.?curricular( activities)?|activities)( (&|and) \w+)?$/i,
};

const SECTION_LABELS = {
  summary: "Summary",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
  achievements: "Achievements",
};

const ACTION_VERBS = new Set(
  (
    "achieved administered analyzed analysed architected authored automated boosted built collaborated configured " +
    "conducted contributed coordinated created cut debugged decreased delivered deployed designed developed directed " +
    "drove eliminated enabled engineered enhanced established executed expanded facilitated generated implemented " +
    "improved increased initiated integrated introduced launched led maintained managed mentored migrated minimized " +
    "modernized monitored negotiated optimized organized orchestrated oversaw owned partnered performed pioneered " +
    "planned presented produced programmed published reduced refactored released researched resolved restructured " +
    "reviewed revamped scaled secured shipped simplified solved spearheaded standardized streamlined strengthened " +
    "supervised tested trained transformed tuned unified upgraded utilized validated won wrote"
  ).split(/\s+/)
);

const WEAK_PHRASES =
  /\b(responsible for|worked on|worked with|helped (with|in|to)|duties (included|include)|tasked with|involved in|assisted (with|in)|participated in|in charge of)\b/i;

const BULLET_MARKER = /^[\s]*[•▪●◦‣▫■□➢➤►\-*–·]\s*/;
const MONTHS = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+(19|20)\d{2}\b/gi;

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const pct = (value) => Math.round(value);

/** Split text into lines and group them under the section they belong to. */
const splitIntoSections = (text) => {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const sections = { header: [] };
  const found = [];
  let current = "header";

  lines.forEach((line) => {
    const candidate = line.replace(/[:\-–|]+$/, "").replace(BULLET_MARKER, "").trim();
    const isShort = candidate.length > 0 && candidate.length <= 40 && candidate.split(/\s+/).length <= 5;
    const name = isShort
      ? Object.keys(SECTION_PATTERNS).find((key) => SECTION_PATTERNS[key].test(candidate))
      : null;

    if (name) {
      current = name;
      if (!found.includes(name)) found.push(name);
      sections[current] = sections[current] || [];
    } else {
      (sections[current] = sections[current] || []).push(line);
    }
  });

  return { lines, sections, found };
};

const detectContact = (text) => {
  const digits = (text.match(/(\+?\d[\d\s().-]{8,}\d)/g) || []).filter(
    (candidate) => candidate.replace(/\D/g, "").length >= 10 && candidate.replace(/\D/g, "").length <= 15
  );

  return {
    email: /[\w.+-]+@[\w-]+\.[\w.-]+/.test(text),
    phone: digits.length > 0,
    linkedin: /linkedin\.com\//i.test(text),
    github: /github\.com\//i.test(text),
    website: /https?:\/\/(?!.*(linkedin|github)\.com)\S+/i.test(text),
  };
};

/** Lines that look like achievement bullets (what recruiters actually read). */
const getBulletLines = (sections) => {
  const body = [...(sections.experience || []), ...(sections.projects || [])];
  const pool = body.length > 0 ? body : Object.values(sections).flat();

  const marked = pool.filter((line) => BULLET_MARKER.test(line)).map((line) => line.replace(BULLET_MARKER, "").trim());
  const candidates = marked.length >= 3 ? marked : pool.map((line) => line.replace(BULLET_MARKER, "").trim());

  // keep sentence-like lines only: skip headings, dates, one-word lines
  return candidates.filter((line) => line.split(/\s+/).length >= 5 && line.length >= 25);
};

const hasMeasurableResult = (line) => {
  const withoutDates = line.replace(/\b(19|20)\d{2}\b/g, " ").replace(MONTHS, " ");
  return /\d/.test(withoutDates);
};

const startsWithActionVerb = (line) => {
  const first = line.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, "");
  return ACTION_VERBS.has(first);
};

const top = (items, count) => items.slice(0, count).join(", ");

/**
 * Analyse a resume. Returns the same shape the AI used to return,
 * plus `insights` (the evidence behind each score).
 */
const analyzeResumeLocally = (resumeText) => {
  const text = String(resumeText || "");
  const { lines, sections, found } = splitIntoSections(text);

  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const contact = detectContact(text);
  const skills = findSkills(text);
  const role = detectRole(skills);

  const bulletLines = getBulletLines(sections);
  const bulletCount = bulletLines.length;
  const quantified = bulletLines.filter(hasMeasurableResult);
  const withVerb = bulletLines.filter(startsWithActionVerb);
  const weakLines = bulletLines.filter((line) => WEAK_PHRASES.test(line));
  const markedBullets = lines.filter((line) => BULLET_MARKER.test(line)).length;

  const firstPerson = (text.match(/\b(I|my|me)\b/g) || []).length;
  const oddChars = (text.match(/[-�]/g) || []).length;
  const oddRatio = text.length ? oddChars / text.length : 0;
  const longLineRatio = lines.length ? lines.filter((line) => line.length > 180).length / lines.length : 0;
  const hasDates = (text.match(/\b(19|20)\d{2}\b/g) || []).length >= 2;

  // ---------- 1. STRUCTURE (100 points) ----------
  let structure = 0;
  if (contact.email) structure += 12;
  if (contact.phone) structure += 10;
  if (contact.linkedin || contact.github) structure += 8;
  const hasExperience = found.includes("experience");
  const hasProjects = found.includes("projects");
  structure += hasExperience && hasProjects ? 30 : hasExperience || hasProjects ? 20 : 0;
  if (found.includes("education")) structure += 15;
  if (found.includes("skills")) structure += 15;
  if (found.includes("summary")) structure += 5;
  if (found.includes("certifications") || found.includes("achievements")) structure += 5;
  structure = clamp(structure);

  // ---------- 2. FORMATTING (start at 100, subtract problems) ----------
  let formatting = 100;
  if (wordCount < 150) formatting -= 35;
  else if (wordCount < 250) formatting -= 20;
  else if (wordCount > 1100) formatting -= 25;
  else if (wordCount > 900) formatting -= 10;
  if (markedBullets === 0 && bulletCount < 3) formatting -= 20;
  else if (markedBullets < 5 && bulletCount < 5) formatting -= 10;
  if (oddRatio > 0.01) formatting -= 20;
  else if (oddRatio > 0.003) formatting -= 8;
  if (longLineRatio > 0.2) formatting -= 15;
  if (!hasDates) formatting -= 10;
  formatting = clamp(formatting);

  // ---------- 3. IMPACT (numbers + action verbs + no weak phrases) ----------
  let impact = 20;
  let quantRatio = 0;
  let verbRatio = 0;
  let weakRatio = 0;
  if (bulletCount > 0) {
    quantRatio = quantified.length / bulletCount;
    verbRatio = withVerb.length / bulletCount;
    weakRatio = weakLines.length / bulletCount;
    const base =
      0.5 * Math.min(1, quantRatio / 0.35) + // aim: about 1 in 3 bullets has a number
      0.4 * Math.min(1, verbRatio / 0.6) + // aim: 6 in 10 bullets start with an action verb
      0.1 * (1 - Math.min(1, weakRatio * 3));
    impact = base * 100 - (firstPerson > 2 ? 5 : 0);
  }
  impact = clamp(pct(impact));

  // ---------- 4. SKILLS (how many, and across how many areas) ----------
  const areas = new Set(skills.map(categoryOf).filter((category) => TECHNICAL_CATEGORIES.includes(category)));
  const skillsScore = clamp(pct(Math.min(1, skills.length / 14) * 70 + Math.min(1, areas.size / 4) * 30));

  // ---------- 5. KEYWORDS (coverage of what this role usually needs) ----------
  const keywords = clamp(pct(Math.min(1, role.coverage / 0.8) * 100));

  const scoreBreakdown = {
    keywords,
    skills: skillsScore,
    impact,
    structure: pct(structure),
    formatting: pct(formatting),
  };

  const atsScore = clamp(
    pct(Object.keys(WEIGHTS).reduce((sum, key) => sum + scoreBreakdown[key] * WEIGHTS[key], 0)),
    1,
    100
  );

  // ---------- Evidence-based feedback ----------
  const strengths = [];
  const weaknesses = [];
  const suggestions = [];

  if (skills.length >= 10) strengths.push(`Strong skill coverage: ${skills.length} recognised skills across ${areas.size} technical areas (${top(skills, 5)}).`);
  if (role.matched.length >= 5) strengths.push(`Good match for a ${role.role} profile: ${role.matched.length} of ${role.expected.length} commonly expected skills are present.`);
  if (bulletCount >= 3 && quantRatio >= 0.3) strengths.push(`${quantified.length} of ${bulletCount} bullet points show measurable results (numbers, percentages or scale).`);
  if (bulletCount >= 3 && verbRatio >= 0.6) strengths.push(`Most bullet points start with a strong action verb (${withVerb.length} of ${bulletCount}).`);
  if (contact.email && contact.phone && (contact.linkedin || contact.github)) strengths.push(`Complete contact details, including ${[contact.linkedin && "LinkedIn", contact.github && "GitHub"].filter(Boolean).join(" and ")}.`);
  if (hasProjects) strengths.push("Includes a Projects section, which shows practical, hands-on work.");
  if (wordCount >= 250 && wordCount <= 900) strengths.push(`Resume length (${wordCount} words) is in the ideal range for ATS reading.`);
  if (found.length >= 5) strengths.push(`Clear structure with ${found.length} standard sections (${found.map((name) => SECTION_LABELS[name]).join(", ")}).`);
  if (strengths.length === 0) strengths.push(`The resume text is readable by an ATS (${wordCount} words extracted).`);

  const missingSections = ["summary", "experience", "projects", "education", "skills"].filter((name) => !found.includes(name));
  if (!contact.email) weaknesses.push("No email address was found.");
  if (!contact.phone) weaknesses.push("No phone number was found.");
  if (!contact.linkedin && !contact.github) weaknesses.push("No LinkedIn or GitHub link was found. Recruiters usually look for one.");
  if (!hasExperience && !hasProjects) weaknesses.push("Neither an Experience nor a Projects section was detected.");
  if (missingSections.length > 0 && missingSections.length < 5) weaknesses.push(`Missing or unlabelled sections: ${missingSections.map((name) => SECTION_LABELS[name]).join(", ")}.`);
  if (bulletCount >= 3 && quantRatio < 0.2) weaknesses.push(quantified.length === 0 ? `None of the ${bulletCount} bullet points include numbers or measurable results.` : `Only ${quantified.length} of ${bulletCount} bullet points include numbers or measurable results.`);
  if (bulletCount >= 3 && verbRatio < 0.4) weaknesses.push(withVerb.length === 0 ? `None of the ${bulletCount} bullet points start with an action verb.` : `Only ${withVerb.length} of ${bulletCount} bullet points start with an action verb.`);
  if (weakLines.length > 0) weaknesses.push(`${weakLines.length} bullet point${weakLines.length > 1 ? "s use" : " uses"} weak phrases such as "responsible for" or "worked on".`);
  if (skills.length < 6) weaknesses.push(skills.length === 0 ? "No recognisable skills were found. Add a clear Skills section." : `Only ${skills.length} recognisable skill${skills.length === 1 ? "" : "s"} found. Add a clear Skills section.`);
  if (wordCount < 250) weaknesses.push(`The resume is short (${wordCount} words). Add more detail about projects and results.`);
  if (wordCount > 900) weaknesses.push(`The resume is long (${wordCount} words). Aim for one or two pages.`);
  if (oddRatio > 0.003) weaknesses.push("Unreadable symbols were found (often icons or special fonts). An ATS cannot read them.");
  if (longLineRatio > 0.2) weaknesses.push("Many very long lines were found. A multi-column or table layout can scramble the text for an ATS.");
  if (firstPerson > 2) weaknesses.push('First-person words ("I", "my") appear several times. Resumes normally avoid them.');
  if (weaknesses.length === 0) weaknesses.push("No major problems detected. Focus on tailoring the resume to each job.");

  if (role.missing.length > 0) suggestions.push(`Add these in-demand ${role.role} skills if you have used them: ${top(role.missing, 6)}.`);
  if (weakLines.length > 0) suggestions.push(`Rewrite weak lines. For example: "${weakLines[0].slice(0, 90)}${weakLines[0].length > 90 ? "..." : ""}" should start with a strong verb and end with a result.`);
  if (bulletCount >= 3 && quantRatio < 0.35) suggestions.push('Add numbers to your bullets. Formula: action verb + what you built + result, for example "Reduced page load time by 35% by lazy-loading images".');
  if (!contact.linkedin && !contact.github) suggestions.push("Add your LinkedIn and GitHub links next to your email and phone number.");
  if (!found.includes("summary")) suggestions.push("Add a 2 to 3 line Summary at the top naming your target role and strongest skills.");
  if (!found.includes("skills")) suggestions.push('Add a dedicated "Skills" section so an ATS can find your keywords quickly.');
  if (!hasProjects && !hasExperience) suggestions.push("Add a Projects section with 2 to 3 projects. Include the tech stack and the result of each.");
  if (wordCount > 900) suggestions.push("Cut older or less relevant details to keep the resume to two pages at most.");
  if (longLineRatio > 0.2 || oddRatio > 0.003) suggestions.push("Use a simple single-column layout with standard fonts and no icons, tables or images.");
  if (suggestions.length === 0) suggestions.push("Tailor the skills and keywords for each job using the Job Match tool.");

  return {
    atsScore,
    scoreBreakdown,
    skills: skills.slice(0, 12),
    missingSkills: role.missing.slice(0, 8),
    strengths: strengths.slice(0, 8),
    weaknesses: weaknesses.slice(0, 8),
    suggestions: suggestions.slice(0, 8),
    insights: {
      role: role.role,
      wordCount,
      bulletCount,
      quantifiedBullets: quantified.length,
      actionVerbBullets: withVerb.length,
      weakPhraseBullets: weakLines.length,
      totalSkills: skills.length,
      skillAreas: areas.size,
      roleSkillsMatched: role.matched.length,
      roleSkillsExpected: role.expected.length,
      sectionsFound: found.map((name) => SECTION_LABELS[name]),
      contact,
      weights: WEIGHTS,
    },
  };
};

module.exports = { analyzeResumeLocally, splitIntoSections, WEIGHTS };
