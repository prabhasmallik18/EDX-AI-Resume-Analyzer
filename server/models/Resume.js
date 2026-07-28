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
        

    },
    {
        timestamps: true,
    }
)

const Resume = mongoose.model("Resume", resumeSchema)

module.exports = Resume