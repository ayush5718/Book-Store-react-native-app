import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password should be atleast 6 char long" });
    }

    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "username should be atleast 3 char long" });
    }

    // cheking if user already exists
    // const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    // if (existingUser) {
    //   return res.status(401).json({ message: "User already exists" });
    // }

    // modified version of finding user
    // finding if user exists with this email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        message: `User already exists with this mail ${existingEmail.email}`,
      });
    }

    // finding if user exists with the given username
    const existingUSername = await User.findOne({ username });
    if (existingUSername) {
      return res.status(400).json({
        message: `User already exists with this username ${existingUSername.username}`,
      });
    }

    // code to get random avatar generated for each new user
    const profileImage = `https://api.dicebear.com/9.x/big-smile/svg?seed=${username}`;

    const user = new User({
      email,
      username,
      password,
      profileImage,
    });

    await user.save();

    // generate a json web token for a user
    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("Error in register route", error);
    return res.status(500).json({ message: "Internal Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // finding user by mail
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid Credentials" });

    // generate token
    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("Internal Server error", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
