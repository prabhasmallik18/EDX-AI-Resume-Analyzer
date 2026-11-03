require("dotenv").config();

const connectDB = require("./config/db");
const app = require("./app");

const PORT = Number(process.env.PORT) || 8000;

// Stop immediately with a clear message instead of failing later in a confusing way.
const missing = ["MONGO_URI", "JWT_SECRET"].filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(
    `Missing required environment variable(s): ${missing.join(", ")}.\n` +
      "Copy .env.example to server/.env and fill the values."
  );
  process.exit(1);
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
