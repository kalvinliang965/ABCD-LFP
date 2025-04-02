import express from "express";
import User from "../db/models/User";
import { 
  getUserProfile, 
  updateUserProfile, 
  registerUser, 
  loginUser 
} from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import mongoose from 'mongoose';
import { Request, Response } from 'express';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

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

// Upload a YAML file
router.post("/api/yaml", async (req, res) => {
  const { userId, filename, content } = req.body;
  try {
    const user = await User.findOne({ googleId: userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    user.yamlFiles.push({ filename, content });
    await user.save();

    // Return the updated YAML files list with IDs
    const updatedUser = await User.findOne({ googleId: userId });
    res.status(200).json({
      success: true,
      message: "YAML file uploaded.",
      yamlFiles: updatedUser?.yamlFiles,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error uploading YAML file." });
  }
});

// Delete a YAML file
router.delete("/api/yaml/:id", async (req, res) => {
  const { userId } = req.body;
  const fileId = req.params.id;

  try {
    const user = await User.findOne({ googleId: userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Find the index of the YAML file
    const yamlFileIndex = user.yamlFiles.findIndex(
      (file: { _id: mongoose.Types.ObjectId | string }) => file._id.toString() === fileId
    );

    if (yamlFileIndex !== -1) {
      // Remove the file using pull method
      user.yamlFiles.pull({ _id: fileId });
      await user.save();
      res.status(200).json({ success: true, message: "YAML file deleted." });
    } else {
      res.status(404).json({ success: false, message: "YAML file not found." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error deleting YAML file." });
  }
});

// Add YAML file
router.post('/yaml', protect, async (req: Request, res: Response) => {
  try {
    const { name, content } = req.body;
    // @ts-ignore
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Add the new YAML file
    user.yamlFiles.push({ name, content, createdAt: new Date() });
    await user.save();
    
    // Return the newly added YAML file
    const newFile = user.yamlFiles[user.yamlFiles.length - 1];
    res.status(201).json(newFile);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding YAML file" });
  }
});

export default router;
