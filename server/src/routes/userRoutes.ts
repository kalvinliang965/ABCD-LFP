import express from "express";
import User from "../db/models/User";
// import { 
//   getUserProfile, 
//   updateUserProfile, 
//   registerUser, 
//   loginUser 
// } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { getCurrentUser, changePassword, getUserProfile, updateUserProfile, signup, 
  loginUser  } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.post('/register', signup);
router.post('/login', loginUser);

// Protected routes
router.use(authenticateJWT);

router.get('/me', getCurrentUser);
router.put('/profile', updateUserProfile);
router.post('/change-password', changePassword);

// Get current user
router.get("/api/current_user", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json(req.user);
});

// Update user profile
router.post("/api/user/update", async (req, res) => {
  const { userId, name } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { googleId: userId },
      { name },
      { new: true }
    );
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error updating profile." });
  }
});

// Save a scenario
router.post("/api/scenarios", async (req, res) => {
  const { userId, scenario } = req.body;
  try {
    const user = await User.findOne({ googleId: userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    user.scenarios.push(scenario);
    await user.save();
    res.status(200).json({ success: true, message: "Scenario saved." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving scenario." });
  }
});

// Retrieve scenarios
router.get("/api/scenarios", async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await User.findOne({ googleId: userId }).populate(
      "scenarios.sharedWith",
      "name email"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    res.status(200).json(user.scenarios);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error retrieving scenarios." });
  }
});

// Share a scenario
router.post("/api/scenarios/share", async (req, res) => {
  const { userId, scenarioId, shareWithEmail, permission } = req.body;
  try {
    // Find the user who wants to share
    const user = await User.findOne({ googleId: userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Find the scenario
    const scenario = user.scenarios.id(scenarioId);
    if (!scenario) {
      return res
        .status(404)
        .json({ success: false, message: "Scenario not found." });
    }

    // Find the user to share with
    const shareWithUser = await User.findOne({ email: shareWithEmail });
    if (!shareWithUser) {
      return res
        .status(404)
        .json({ success: false, message: "User to share with not found." });
    }

    // Add the user to the shared list if not already there
    if (!scenario.sharedWith.includes(shareWithUser._id)) {
      scenario.sharedWith.push(shareWithUser._id);
    }

    // Set permissions
    scenario.permissions = permission;

    await user.save();
    res.status(200).json({ success: true, message: "Scenario shared." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error sharing scenario." });
  }
});

export default router;
