require("dotenv").config()
const express = require("express")
const cors = require('cors')

const connectDB = require("./config/db")

const authRoutes = require("./routes/authRoutes")
const resumeRoutes = require("./routes/resumeRoutes")

const app = express()

//Database connection
connectDB()

const PORT = process.env.PORT || 8000;

//Middleware
app.use(express.json())

app.use(
    cors({
        origin: "http://localhost:5173"
    })
)

//Routes
app.use("/api/auth", authRoutes)
app.use("/api/resume", resumeRoutes)


app.get("/", (req, res)=>{
    res.send("AI Resume Analyzer Backend is Running")
})

app.listen(PORT, ()=>{
    console.log(
        `Server is running on http://localhost:${PORT}`
    )
})