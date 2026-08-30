const mongoose = require("mongoose");
const Resume = require("../models/Resume");
const fs = require("fs");
const path = require("path");
const { createResume } = require("../services/resumeService");

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a PDF resume to upload.",
      });
    }

    const resume = await createResume(req.file, req.user.userId);

    return res.status(201).json({
      success: true,
      message: "Resume uploaded and analyzed successfully.",
      data: resume,
    });
  } catch (error) {
    console.error("Upload Resume Error:", error);

    if (req.file?.path) {
      try {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("Upload cleanup error:", cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to analyze resume.",
    });
  }
};

const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    console.error("Get Resumes Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load resume history.",
    });
  }
};

const getResumeById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume ID.",
      });
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.userId,
    }).lean();

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    console.error("Get Resume Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load resume analysis.",
    });
  }
};

const deleteResume = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume ID.",
      });
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found.",
      });
    }

    const filePath = path.resolve(__dirname, "..", resume.filePath);
    const uploadsDirectory = path.resolve(__dirname, "..", "uploads");

    if (
      filePath.startsWith(`${uploadsDirectory}${path.sep}`) &&
      fs.existsSync(filePath)
    ) {
      fs.unlinkSync(filePath);
    }

    await Resume.deleteOne({ _id: resume._id });

    return res.status(200).json({
      success: true,
      message: "Resume deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Resume Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete resume.",
    });
  }
};

module.exports = {
  uploadResume,
  getMyResumes,
  deleteResume,
  getResumeById,
};
