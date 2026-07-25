const express = require("express")

const {testAuth, registerUser, loginUser, getProfile} = require("../controllers/authController")
const protect = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/", testAuth)

router.post("/register", registerUser)

router.post("/login", loginUser)

router.get("/profile", protect, getProfile)

module.exports = router