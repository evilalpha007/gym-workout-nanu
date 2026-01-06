const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const generateTokenAndSetCookie = require("../utils/generateToken");

// @desc    Signup user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  console.log("\n🚀 SIGNUP REQUEST RECEIVED");
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  try {
    const {
      username,
      email,
      password,
      targetWorkoutDaysPerWeek,
      daysPerWeek,
      age,
      height,
      weight,
      bio,
    } = req.body;

    console.log("Extracted fields:", {
      username,
      email,
      password: password ? "***" : "MISSING",
      targetWorkoutDaysPerWeek,
      daysPerWeek,
      age,
      height,
      weight,
      bio,
    });

    // Validate required fields
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required" });
    }

    // Handle different field names for days per week
    const workoutDays = targetWorkoutDaysPerWeek || daysPerWeek;
    if (!workoutDays) {
      return res
        .status(400)
        .json({ error: "Workout days per week is required" });
    }

    const userExists = await User.findOne({ $or: [{ username }, { email }] });

    if (userExists) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    console.log("Creating user with data:", {
      username,
      email,
      password: "***",
      targetWorkoutDaysPerWeek: workoutDays,
      age,
      height,
      weight,
      bio,
    });

    const user = await User.create({
      username,
      email,
      password,
      targetWorkoutDaysPerWeek: workoutDays,
      age,
      height,
      weight,
      bio,
      // Default values are handled in Schema
    });

    console.log("✅ User created successfully:", user._id);

    if (user) {
      try {
        generateTokenAndSetCookie(user._id, res);
      } catch (tokenError) {
        console.error("Error generating token:", tokenError);
        // User is created but token generation failed
        return res.status(500).json({
          error: "User created but failed to generate authentication token",
          details: tokenError.message,
        });
      }

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        targetWorkoutDaysPerWeek: user.targetWorkoutDaysPerWeek,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error in signup controller:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Full error:", error);

    // Return more detailed error for validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: errors.join(", ") });
    }
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }
    res.status(500).json({
      error: error.message || "Internal Server Error",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { username, password } = req.body; // Can be username or email if we wanted, requirement says login using secure session (username usually implied, but handled easily)

    // Requirement says "User signup with username, email...", logic implies login is standard.
    // Let's assume login with username as per request "Clicking username...".
    // I'll support both for flexibility or just username. Let's stick to username as per 'User signup with' usually implies username login unless specified 'email login'.

    // Check for user (username OR email)
    const user = await User.findOne({
        $or: [{ username }, { email: username }]
    });
    const isPasswordCorrect = await user?.comparePassword(password || "");

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      targetWorkoutDaysPerWeek: user.targetWorkoutDaysPerWeek,
    });
  } catch (error) {
    console.error("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { 
      maxAge: 0,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
      secure: process.env.NODE_ENV === "development" ? false : true,
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc    Get current user profile (for validation on load)
// @route   GET /api/auth/me
// @access  Protected
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getMe controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { signup, login, logout, getMe };
