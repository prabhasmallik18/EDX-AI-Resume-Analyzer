const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env");
const examplePath = path.resolve(__dirname, "..", ".env.example");

// Auto-initialize server/.env from template if missing
if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
  try {
    fs.copyFileSync(examplePath, envPath);
    console.log("ℹ Created server/.env automatically from .env.example");
  } catch (err) {
    console.warn("Could not auto-copy .env.example:", err.message);
  }
}

require("dotenv").config({ path: envPath });

const connectDB = require("./config/db");
const app = require("./app");

const PORT = Number(process.env.PORT) || 8000;

// Development fallbacks if variables are not explicitly set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "edx_resume_analyzer_dev_secret_key_2026";
  console.warn("ℹ Using default development JWT_SECRET. For production, set JWT_SECRET in server/.env");
}

if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = "mongodb://127.0.0.1:27017/edx-resume-analyzer";
  console.warn("ℹ MONGO_URI not found. Defaulting to local: mongodb://127.0.0.1:27017/edx-resume-analyzer");
}

const engine = String(process.env.ANALYSIS_ENGINE || "local").toLowerCase();
console.log(`Analysis engine: ${engine === "hybrid" ? "hybrid (built-in + Gemini)" : "built-in (no AI key needed)"}`);

if (engine === "hybrid" && !process.env.GEMINI_API_KEY) {
  console.warn("Warning: ANALYSIS_ENGINE=hybrid but GEMINI_API_KEY is empty. The built-in engine will be used.");
}

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
