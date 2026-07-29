const Resume = require("../models/Resume");
const extractedTextFromPDF = require("../utils/pdfParser");
const {analyzeResume} = require("./aiService")

const createResume = async(file, userId) =>{
    const extractedText = await extractedTextFromPDF(file.path)
    const aiResponse = await analyzeResume(extractedText)

    console.log(aiResponse.atsScore)
    console.log(aiResponse.skills)
    console.log(aiResponse.suggestions)

    const resume = await Resume.create({
      user: userId,
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      fileSize: file.size, extractedText,
      analysisStatus: "Completed",
      atsScore: aiResponse.atsScore,
      skills: aiResponse.skills,
      missingSkills: aiResponse.missingSkills,
      strengths: aiResponse.strengths,
      weaknesses: aiResponse.weaknesses,
      suggestions: aiResponse.suggestions
    });
    return resume;
}

module.exports = {
    createResume,
}


