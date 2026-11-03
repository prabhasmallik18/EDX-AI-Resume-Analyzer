/**
 * Skill catalog used by the built-in analysis engine.
 *
 * SKILL_CATEGORIES : which area each skill belongs to
 * ROLE_PROFILES    : the skills a recruiter normally expects for a job role
 *
 * Names must match the display names in keywordMatcher.js exactly.
 */
const SKILL_CATEGORIES = {
  languages: ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Kotlin", "Swift", "SQL", "HTML", "CSS", "Bash"],
  frontend: ["React", "React Native", "Next.js", "Angular", "Vue", "Redux", "Tailwind CSS", "Bootstrap", "Sass", "Vite", "Webpack", "Responsive Design"],
  backend: ["Node.js", "Express.js", "Django", "Flask", "FastAPI", "Spring Boot", "Spring", ".NET", "Laravel", "REST API", "GraphQL", "Microservices", "WebSocket", "JWT", "OAuth", "Authentication"],
  database: ["MongoDB", "Mongoose", "MySQL", "PostgreSQL", "SQLite", "Redis", "Firebase", "Elasticsearch", "NoSQL"],
  devops: ["Git", "GitHub", "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud", "CI/CD", "Linux", "Nginx", "Jenkins", "Terraform", "Vercel", "Heroku", "Netlify"],
  testing: ["Jest", "Mocha", "Cypress", "Selenium", "Unit Testing", "Test Driven Development", "Postman"],
  dataai: ["Machine Learning", "Deep Learning", "Artificial Intelligence", "NLP", "LLM", "Prompt Engineering", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn", "Data Analysis", "Data Visualization", "Power BI", "Tableau", "Excel", "ETL", "Big Data", "Apache Spark", "Hadoop"],
  concepts: ["Data Structures", "Algorithms", "Object Oriented Programming", "System Design", "Design Patterns", "MVC", "API Integration", "Full Stack", "Cybersecurity", "Web Accessibility", "SEO", "Performance Optimization"],
  tools: ["Jira", "Figma"],
  professional: ["Agile", "Scrum", "Project Management", "Product Management", "Stakeholder Management", "Leadership", "Team Collaboration", "Communication", "Problem Solving", "Critical Thinking", "Time Management", "Mentoring", "Presentation", "Customer Service", "Sales", "Marketing", "Content Writing", "Budgeting", "Financial Analysis", "Research", "Analytical Skills"],
};

// Categories that count as "technical breadth" in the skills score.
const TECHNICAL_CATEGORIES = ["languages", "frontend", "backend", "database", "devops", "testing", "dataai", "concepts"];

const ROLE_PROFILES = [
  {
    name: "Full Stack Developer",
    expected: ["JavaScript", "React", "Node.js", "Express.js", "MongoDB", "SQL", "HTML", "CSS", "REST API", "Git", "TypeScript", "Docker", "AWS", "Unit Testing", "CI/CD", "Authentication"],
  },
  {
    name: "Frontend Developer",
    expected: ["JavaScript", "TypeScript", "React", "HTML", "CSS", "Responsive Design", "Git", "Redux", "Tailwind CSS", "Next.js", "Unit Testing", "Web Accessibility", "Figma", "REST API"],
  },
  {
    name: "Backend Developer",
    expected: ["Node.js", "Python", "Java", "REST API", "SQL", "PostgreSQL", "MongoDB", "Docker", "Git", "Authentication", "Microservices", "AWS", "CI/CD", "Redis", "Unit Testing"],
  },
  {
    name: "Data / ML Engineer",
    expected: ["Python", "SQL", "Pandas", "NumPy", "Machine Learning", "Scikit-learn", "Data Visualization", "TensorFlow", "PyTorch", "Git", "Data Analysis", "Excel", "Power BI", "Deep Learning"],
  },
  {
    name: "DevOps / Cloud Engineer",
    expected: ["Linux", "Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Jenkins", "Git", "Bash", "Azure", "Nginx", "Python"],
  },
];

const GENERAL_PROFILE = {
  name: "General Professional",
  expected: ["Communication", "Problem Solving", "Team Collaboration", "Project Management", "Excel", "Leadership", "Time Management", "Presentation", "Analytical Skills", "Research"],
};

const categoryOf = (skill) =>
  Object.keys(SKILL_CATEGORIES).find((category) => SKILL_CATEGORIES[category].includes(skill)) || null;

/**
 * Pick the job role this resume looks most like.
 * @param {string[]} skills skills found in the resume
 */
const detectRole = (skills) => {
  const have = new Set(skills);

  const scored = ROLE_PROFILES.map((profile) => {
    const matched = profile.expected.filter((skill) => have.has(skill));
    return { profile, matched, coverage: matched.length / profile.expected.length };
  }).sort((a, b) => b.coverage - a.coverage);

  const best = scored[0];

  // Fewer than 3 matches means this is not clearly a tech resume.
  const profile = best.matched.length >= 3 ? best.profile : GENERAL_PROFILE;
  const matched = profile.expected.filter((skill) => have.has(skill));

  return {
    role: profile.name,
    expected: profile.expected,
    matched,
    missing: profile.expected.filter((skill) => !have.has(skill)),
    coverage: matched.length / profile.expected.length,
  };
};

module.exports = { SKILL_CATEGORIES, TECHNICAL_CATEGORIES, ROLE_PROFILES, categoryOf, detectRole };
