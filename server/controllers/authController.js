const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

const User = require("../models/User");

const testAuth = (req, res) => {
  res.json({
    success: true,
    message: "Auth contoller working",
  });
};
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User registered Successfully",
      data: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);


    const token = jwt.sign({
        userId : user._id,
        email: user.email,
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "7d"
    }
)

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Login successfully",
      token,
      data: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProfile = async (req, res)=>{
    res.status(200).json({
        success: true,
        message: "Profile fetched sucessfully",
        user: req.user,
    })
}

module.exports = {
  testAuth,
  registerUser,
  loginUser,
  getProfile,
};
