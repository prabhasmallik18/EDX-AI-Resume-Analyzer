/**
 * Keyword matcher: compares a job description with a resume WITHOUT using AI.
 *
 * Why this exists:
 *  - It is fast, free and gives the same answer every time (deterministic).
 *  - It still works when the Gemini API is down or the quota is finished.
 *  - The AI result is combined with it, so the final score is more trustworthy.
 *
 * Each skill below is an array: [display name, ...other spellings].
 * Example: ["JavaScript", "js", "ecmascript"] means "js" in a resume counts as JavaScript.
 */
const SKILLS = [
  // Languages
  ["JavaScript", "js", "ecmascript", "es6"],
  ["TypeScript", "ts"],
  ["Python"],
  ["Java"],
  ["C++", "cpp"],
  ["C#", "c sharp", "csharp"],
  ["Go", "golang", "go language"],
  ["Rust"],
  ["PHP"],
  ["Ruby"],
  ["Kotlin"],
  ["Swift"],
  ["SQL"],
  ["HTML", "html5"],
  ["CSS", "css3"],
  ["Bash", "shell scripting"],

  // Frontend
  ["React", "react.js", "reactjs"],
  ["React Native"],
  ["Next.js", "nextjs", "next js"],
  ["Angular", "angularjs"],
  ["Vue", "vue.js", "vuejs"],
  ["Redux"],
  ["Tailwind CSS", "tailwind", "tailwindcss"],
  ["Bootstrap"],
  ["Sass", "scss"],
  ["Vite"],
  ["Webpack"],
  ["Responsive Design", "responsive web design"],

  // Backend
  ["Node.js", "nodejs", "node js"],
  ["Express.js", "expressjs", "express js"],
  ["Django"],
  ["Flask"],
  ["FastAPI"],
  ["Spring Boot", "springboot"],
  ["Spring", "spring framework"],
  [".NET", "dotnet", "asp.net"],
  ["Laravel"],
  ["REST API", "restful", "rest apis", "restful api", "restful apis"],
  ["GraphQL"],
  ["Microservices", "microservice"],
  ["WebSocket", "websockets", "socket.io"],
  ["JWT", "json web token", "json web tokens"],
  ["OAuth", "oauth2"],
  ["Authentication", "authorization"],

  // Databases
  ["MongoDB", "mongo"],
  ["Mongoose"],
  ["MySQL"],
  ["PostgreSQL", "postgres"],
  ["SQLite"],
  ["Redis"],
  ["Firebase"],
  ["Elasticsearch"],
  ["NoSQL"],

  // DevOps / Cloud
  ["Git"],
  ["GitHub", "github actions"],
  ["Docker"],
  ["Kubernetes", "k8s"],
  ["AWS", "amazon web services"],
  ["Azure"],
  ["Google Cloud", "gcp"],
  ["CI/CD", "ci cd", "continuous integration", "continuous deployment"],
  ["Linux"],
  ["Nginx"],
  ["Jenkins"],
  ["Terraform"],
  ["Vercel"],
  ["Heroku"],
  ["Netlify"],

  // Testing & tools
  ["Jest"],
  ["Mocha"],
  ["Cypress"],
  ["Selenium"],
  ["Unit Testing", "unit tests", "unit test"],
  ["Test Driven Development", "tdd"],
  ["Postman"],
  ["Jira"],
  ["Figma"],

  // Data / AI
  ["Machine Learning", "ml"],
  ["Deep Learning"],
  ["Artificial Intelligence", "ai", "generative ai", "genai"],
  ["NLP", "natural language processing"],
  ["LLM", "llms", "large language models", "large language model"],
  ["Prompt Engineering"],
  ["TensorFlow"],
  ["PyTorch"],
  ["Pandas"],
  ["NumPy"],
  ["Scikit-learn", "sklearn"],
  ["Data Analysis", "data analytics"],
  ["Data Visualization"],
  ["Power BI", "powerbi"],
  ["Tableau"],
  ["Excel", "microsoft excel", "ms excel", "advanced excel"],
  ["ETL"],
  ["Big Data"],
  ["Apache Spark", "spark", "pyspark"],
  ["Hadoop"],

  // Concepts
  ["Data Structures", "data structures and algorithms", "dsa"],
  ["Algorithms"],
  ["Object Oriented Programming", "oop", "object-oriented"],
  ["System Design"],
  ["Design Patterns"],
  ["MVC"],
  ["API Integration", "api development", "api design"],
  ["Full Stack", "full-stack", "fullstack"],
  ["Cybersecurity", "information security"],
  ["Web Accessibility", "accessibility", "wcag"],
  ["SEO"],
  ["Performance Optimization", "performance tuning"],

  // Professional skills
  ["Agile", "agile methodology"],
  ["Scrum"],
  ["Project Management"],
  ["Product Management"],
  ["Stakeholder Management"],
  ["Leadership"],
  ["Team Collaboration", "teamwork", "cross-functional"],
  ["Communication", "communication skills"],
  ["Problem Solving", "problem-solving"],
  ["Critical Thinking"],
  ["Time Management"],
  ["Mentoring", "mentorship"],
  ["Presentation"],
  ["Customer Service"],
  ["Sales"],
  ["Marketing"],
  ["Content Writing", "copywriting"],
  ["Budgeting"],
  ["Financial Analysis"],
  ["Research"],
  ["Analytical Skills", "analytical thinking"],
];

// Words ignored when we have to fall back to plain word counting.
const STOP_WORDS = new Set(
  (
    "a about above after again all also an and any are as at be because been before being below between both but by " +
    "can could did do does doing down during each few for from further had has have having he her here hers him his how " +
    "i if in into is it its just may me more most must my no nor not now of off on once only or other our out over own " +
    "same she should so some such than that the their them then there these they this those through to too under until " +
    "up us very was we were what when where which while who whom why will with would you your yours " +
    "ability able etc including include includes strong good great excellent knowledge understanding experience " +
    "experienced work working works role roles job team teams company candidate candidates required requirements " +
    "responsibilities responsible preferred plus years year looking join position opportunity skills skill " +
    "using use used build building develop developing development ensure support new best well across within " +
    "environment related relevant business high based etc about like need needs want benefits apply"
  ).split(/\s+/)
);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Lower-case and unify whitespace so matching is predictable.
const normalize = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ");

/**
 * Build one regex per skill. The "boundary" rule stops "java" from matching
 * inside "javascript" and "c" style false positives.
 */
// These names are also normal English words ("go to market", "excel at", "spring"),
// so only their longer aliases are matched, never the bare word itself.
const NO_SELF_MATCH = new Set(["Go", "Excel", "Spring"]);

const SKILL_MATCHERS = SKILLS.map(([display, ...aliases]) => {
  const names = NO_SELF_MATCH.has(display) ? aliases : [display, ...aliases];
  const variants = names.map((v) => escapeRegex(v.toLowerCase()));
  const pattern = new RegExp(
    `(?<![a-z0-9+#.])(?:${variants.join("|")})(?![a-z0-9+#]|\\.[a-z0-9])`,
    "i"
  );
  return { display, pattern };
});

/** Return the list of known skills found inside a piece of text. */
const findSkills = (text) => {
  const normalized = normalize(text);
  return SKILL_MATCHERS.filter(({ pattern }) => pattern.test(normalized)).map(
    ({ display }) => display
  );
};

/** Fallback for non-technical jobs: most repeated meaningful words. */
const frequencyKeywords = (text, limit = 15) => {
  const counts = new Map();

  normalize(text)
    .split(/[^a-z0-9+#]+/)
    .filter((word) => word.length >= 4 && !STOP_WORDS.has(word) && !/^\d+$/.test(word))
    .forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));

  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word);
};

const MIN_SKILLS_FOR_DICTIONARY_MODE = 3;

/**
 * Compare job description against resume text.
 * @returns {{keywordScore:number, matchedKeywords:string[], missingKeywords:string[], totalKeywords:number, mode:string}}
 */
const matchKeywords = (resumeText, jobDescription) => {
  let jobKeywords = findSkills(jobDescription);
  let mode = "skills";

  if (jobKeywords.length < MIN_SKILLS_FOR_DICTIONARY_MODE) {
    const extra = frequencyKeywords(jobDescription);
    // Merge: known skills first, then repeated words we have not listed yet.
    const seen = new Set(jobKeywords.map((k) => k.toLowerCase()));
    extra.forEach((word) => {
      if (!seen.has(word)) jobKeywords.push(word);
    });
    mode = "frequency";
  }

  if (jobKeywords.length === 0) {
    return {
      keywordScore: 0,
      matchedKeywords: [],
      missingKeywords: [],
      totalKeywords: 0,
      mode,
    };
  }

  const resumeSkills = new Set(findSkills(resumeText).map((s) => s.toLowerCase()));
  const resumeNormalized = normalize(resumeText);

  const isInResume = (keyword) => {
    const lower = keyword.toLowerCase();
    if (resumeSkills.has(lower)) return true;
    // For frequency-mode words (not in the dictionary) check plain word presence.
    return new RegExp(`(?<![a-z0-9+#])${escapeRegex(lower)}(?![a-z0-9+#])`).test(resumeNormalized);
  };

  const matchedKeywords = [];
  const missingKeywords = [];

  jobKeywords.forEach((keyword) => {
    (isInResume(keyword) ? matchedKeywords : missingKeywords).push(keyword);
  });

  return {
    keywordScore: Math.round((matchedKeywords.length / jobKeywords.length) * 100),
    matchedKeywords,
    missingKeywords,
    totalKeywords: jobKeywords.length,
    mode,
  };
};

module.exports = { matchKeywords, findSkills, frequencyKeywords, STOP_WORDS, SKILLS };
