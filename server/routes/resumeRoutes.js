const express = require("express");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { aiLimiter } = require("../middleware/rateLimiters");

const {
  uploadResume,
  getMyResumes,
  deleteResume,
  getResumeById,
  matchJob,
  reanalyzeResume,
  getStats,
} = require("../controllers/resumeController");

const router = express.Router();

// aiLimiter = max requests per hour, because every upload / match uses the AI quota.
router.post("/upload", protect, aiLimiter, upload.single("resume"), uploadResume);

router.get("/my-resumes", protect, getMyResumes);

// IMPORTANT: "/stats" must stay ABOVE "/:id", otherwise Express treats "stats" as an id.
router.get("/stats", protect, getStats);

router.post("/:id/match", protect, aiLimiter, matchJob);

router.post("/:id/reanalyze", protect, aiLimiter, reanalyzeResume);

router.get("/:id", protect, getResumeById);

router.delete("/:id", protect, deleteResume);

module.exports = router;
