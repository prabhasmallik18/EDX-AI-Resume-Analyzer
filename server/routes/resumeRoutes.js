const express = require("express")

const protect = require("../middleware/authMiddleware")
const upload = require("../middleware/uploadMiddleware")

const {uploadResume, getMyResumes, deleteResume, getResumeById} = require("../controllers/resumeController")


const router = express.Router()

 router.post("/upload", protect, upload.single("resume"), uploadResume)

 router.get("/my-resumes", protect, getMyResumes)

 router.get("/:id", protect, getResumeById)

 router.delete("/:id", protect, deleteResume)


 module.exports = router;