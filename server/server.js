require("dotenv").config()
const express = require("express")

const connectDB = require("./config/db")

const authRoutes = require("./routes/authRoutes")

const app = express()

//Database connection
connectDB()

const PORT = process.env.PORT || 8000;

//Middleware
app.use(express.json())

//Routes
app.use("/api/auth", authRoutes)


app.get("/", (req, res)=>{
    res.send("AI Resume Analyzer Backend is Running")
})

app.listen(PORT, ()=>{
    console.log(
        `Server is running on http://localhost:${PORT}`
    )
})