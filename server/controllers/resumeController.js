const Resume = require("../models/Resume");

const fs = require("fs");
const path = require("path");

const extractedTextFromPDF = require("../utils/pdfParser")
const {createResume} = require("../services/resumeService")

const uploadResume = async (req, res) => {
  try {
    const resume = await createResume(req.file, req.user.userId)
    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      data: resume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({
      user: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getResumeById = async (req, res) =>{
  try{
     const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.userId,
     })

     if(!resume){
      return res.status(404).json({
        success: false,
        message: "Resume not found"
      })
     }
     res.status(200).json({
      success: true,
      data: resume,
     })
  }catch(error){
    console.error("Get Resume Error:", error)

    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}


const deleteResume = async(req, res) =>{
    try{
        const resume = await Resume.findById(req.params.id)

        if(!resumes){
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            })
        }

        if(resume.user.toString()!== req.user.userId){
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            })
        }

        const filePath = path.join(__dirname, "..", resume.filePath)

        if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath)
        }

        await Resume.findByIdAndDelete(req.params.id)

        res.status(200).json({
      success: true,
      message: "Resume deleted Successfully"
    });
    }catch(error){
        res.status(500).json({
            success: false,
            message : error.message
        })
    }
}

module.exports = {
  uploadResume,
  getMyResumes,
  deleteResume,
  getResumeById,
};
