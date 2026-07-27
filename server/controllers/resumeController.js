const Resume = require("../models/Resume")


const uploadResume = async (req, res) =>{
    try{

        const resume = await Resume.create({
            user: req.user.userId,
            originalName: req.file.originalname,
            fileName: req.file.filename,
            filePath: req.file.path,
            fileSize: req.file.size,
        })
        res.status(200).json({
            success: true, 
            message: "Resume uploaded successfully",
            data: resume,
        })
    }catch(error){
        res.status(500).json({
            success: false, 
            message: error.message,
        })
    }
}

module.exports = {
    uploadResume,
}