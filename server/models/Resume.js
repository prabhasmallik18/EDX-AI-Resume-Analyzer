const mongoose = require("mongoose")

const resumeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        originalName :{
            type: String,
            required: true,
        },
        fileName: {
            type: String,
            required: true,
        },
        filePath: {
            type: String,
            required: true,
        },
        fileSize: {
            type: String,
            required: true,
        },
        extractedText:{
            type: String,
            default: "",
        },
        analysisStatus: {
            type: String,
            enum: ["Pending", "Processing","Completed", "Failed"],
            default: "Pending",
        },
        atsScore:{
            type: Number,
            default: null,
        },
        skills:{
            type: [String],
            default: [],
        },
        missingSkills:{
            type: [String],
            default: [],
        },
        strengths:{
            type: [String],
            default: [],
        },
        weaknesses:{
            type: [String],
            default: [],
        },
        suggestions:{
            type: [String],
            default: [],
        },

    },
    {
        timestamps: true,
    }
)

const Resume = mongoose.model("Resume", resumeSchema)

module.exports = Resume