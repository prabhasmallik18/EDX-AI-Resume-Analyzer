require("dotenv").config()
const express = require("express")

const app = express()

const PORT = process.env.PORT || 8000;

app.get("/", (req, res)=>{
    res.send("AI Resume Analyzer Backend is Running")
})

app.listen(PORT, ()=>{
    console.log(
        `Server is running on http://localhost:${PORT}`
    )
})