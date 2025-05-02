import express from "express";
import { Request, Response } from "express";
import Scenario from "../db/models/Scenario";
import { authenticateJWT } from "../middleware/auth.middleware";
import { UserDocument } from "../db/models/User";
import ScenarioShare from "../db/models/ScenarioShare";
import User from "../db/models/User";
import { checkScenarioAccess, requireWriteAccess } from "../middleware/scenario-permission.middleware";
import mongoose from "mongoose";

const router = express.Router();


//ensures that all routes below require a valid JWT token
router.use(authenticateJWT);

//when a user presses Continue in the form
//we send the current state to the server to create or update draft

router.post("/", async (req: Request, res: Response) => {
  try {
    //check if the user is logged in
    const user = req.user as UserDocument;
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    //merge the incoming data with the user's _id and use the is_draft value from the request
    const scenario_data = {
      ...req.body,
      userId: user._id,
      isDraft: req.body.isDraft ?? true 
    };
    //save the new draft to the DB
    const new_scenario = new Scenario(scenario_data);
    await new_scenario.save();

    res.status(201).json({
      success: true,
      message: "Scenario created successfully",
      data: new_scenario
    });
  } catch (error) {
    console.error("Error creating scenario:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create scenario" 
    });
  }
});

//when users make changes on later steps we update the complete draft

router.put("/:id", checkScenarioAccess, requireWriteAccess, async (req: Request, res: Response) => {
  try {
    //check that the user is logged in
    const user = req.user as UserDocument;
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }

    //get the scenario id from the route params
    const scenario_id = req.params.id;

    //ai generated console.logs:
    //promt: please write the console log statements for monitoring isDraft changes 
    console.log("PUT /:id - Request body:", req.body);
    console.log("PUT /:id - isDraft from request:", req.body.isDraft);
    
    const scenario_data = {
      ...req.body,
      isDraft: req.body.isDraft ?? true // Use isDraft consistently
    };
    
    //ai generated console.logs:
    //promt: please write the console log statements for monitoring isDraft changes
    console.log("PUT /:id - Final scenario data:", scenario_data);
    console.log("PUT /:id - Final isDraft value:", scenario_data.isDraft);

    //using findOneAndUpdate to update the scenario
    const updated_scenario = await Scenario.findOneAndUpdate(
      { _id: scenario_id },
      { $set: scenario_data },
      { new: true, runValidators: true }
    );

    if (!updated_scenario) {
      return res.status(404).json({ 
        success: false, 
        message: "Scenario not found or unauthorized" 
      });
    }
    //ai generated console.logs:
    //promt: please write the console log statements for monitoring isDraft changes
    console.log("PUT /:id - Updated scenario:", updated_scenario);
    console.log("PUT /:id - Updated isDraft value:", updated_scenario.isDraft);

    res.json({
      success: true,
      message: "Scenario updated successfully",
      data: updated_scenario
    });
  } catch (error) {
    console.error("Error updating scenario:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update scenario" 
    });
  }
});

//for user to load unfinished scenarioS
//for front end drafts, this will be used to display users drafts
router.get("/", async (req: Request, res: Response) => {
  try {
    const user = req.user as UserDocument;
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    const is_draft = req.query.is_draft === "true";
    const scenarios = await Scenario.find({ 
      userId: user._id,
      isDraft: is_draft
    });
    res.json({
      success: true,
      message: "Scenarios retrieved successfully",
      data: scenarios
    });
  } catch (error) {
    console.error("Error retrieving scenarios:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to retrieve scenarios" 
    });
  }
});


//get all scenarios both drafts and published
router.get("/all", async (req: Request, res: Response) => {
  try {
    const user = req.user as UserDocument;
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }

    const scenarios = await Scenario.find({ userId: user._id });

    res.json({
      success: true,
      message: "All scenarios retrieved successfully",
      data: scenarios
    });
  } catch (error) {
    console.error("Error retrieving all scenarios:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to retrieve scenarios" 
    });
  }
});

// Get scenarios shared with the current user
router.get("/shared-with-me", async (req: Request, res: Response) => {
  try {
    const user = req.user as UserDocument;
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    
    console.log("Fetching shared scenarios for user:", user._id);
    
    // Find all share records where this user is the recipient
    const shareRecords = await ScenarioShare.find({
      sharedWithId: user._id
    }).populate('originalOwnerId', 'name email');
    
    console.log("Found share records:", shareRecords.length);
    
    if (!shareRecords || shareRecords.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No scenarios have been shared with you",
        data: []
      });
    }
    
    // Get all the copied scenarios for this user
    const sharedScenarios = await Promise.all(
      shareRecords.map(async (share) => {
        try {
          const copiedScenario = await Scenario.findById(share.copiedScenarioId);
          if (!copiedScenario) {
            console.log("Copied scenario not found:", share.copiedScenarioId);
            return null;
          }
          
          const owner = share.originalOwnerId as any;
          const scenarioData = copiedScenario.toObject();
          
          return {
            _id: copiedScenario._id,
            name: copiedScenario.name || "Unnamed Scenario",
            maritalStatus: copiedScenario.maritalStatus || (scenarioData as any).data?.maritalStatus || "Not specified",
            residenceState: copiedScenario.residenceState || (scenarioData as any).data?.residenceState || "Not specified",
            createdAt: copiedScenario.createdAt || new Date(),
            ownerName: owner?.name || owner?.email || 'Unknown',
            ownerId: share.originalOwnerId,
            originalScenarioId: share.originalScenarioId,
            permission: share.permission
          };
        } catch (err) {
          console.error("Error processing share record:", err);
          return null;
        }
      })
    );
    
    // Filter out null values (in case a scenario was deleted)
    const filteredScenarios = sharedScenarios.filter(scenario => scenario !== null);
    
    console.log("Final shared scenarios count:", filteredScenarios.length);
    
    res.status(200).json({
      success: true,
      message: "Shared scenarios retrieved successfully",
      data: filteredScenarios
    });
  } catch (error: any) {
    console.error("Error fetching shared scenarios:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to retrieve shared scenarios",
      error: error.message || "Unknown error"
    });
  }
});

// Share a scenario with another user
router.post("/share", async (req: Request, res: Response) => {
  try {
    const user = req.user as UserDocument;
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    
    // Ensure user._id is a valid ObjectId
    const userId = user._id as mongoose.Types.ObjectId;
    
    const { scenarioId, shareWithEmail, permission = 'read' } = req.body;
    
    // Validate required fields
    if (!scenarioId || !shareWithEmail) {
      return res.status(400).json({
        success: false,
        message: "Scenario ID and recipient email are required"
      });
    }
    
    // Validate permission value
    if (permission !== 'read' && permission !== 'write') {
      return res.status(400).json({
        success: false,
        message: "Permission must be either 'read' or 'write'"
      });
    }
    
    // Find the scenario and check ownership
    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: "Scenario not found"
      });
    }
    
    if (scenario.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only share scenarios you own"
      });
    }
    
    // Find the user to share with
    const userToShareWith = await User.findOne({ email: shareWithEmail });
    if (!userToShareWith) {
      return res.status(404).json({
        success: false,
        message: "User with this email not found"
      });
    }
    
    // Don't share with self
    if (userToShareWith._id.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot share a scenario with yourself"
      });
    }
    
    // Check if already shared with this user
    const existingShare = await ScenarioShare.findOne({
      originalScenarioId: scenarioId,
      sharedWithId: userToShareWith._id
    });
    
    if (existingShare) {
      // Update permission if already shared
      existingShare.permission = permission;
      await existingShare.save();
      
      return res.status(200).json({
        success: true,
        message: `Updated sharing permissions for ${shareWithEmail}`
      });
    }
    
    // Create a deep copy of the scenario
    const scenarioData = scenario.toObject() as any;
    
    // Clean up the data for the new copy
    delete scenarioData._id; // Remove the original ID so a new one is generated
    delete scenarioData.__v; // Remove version field
    
    // Set the new scenario properties - assign to the shared user
    scenarioData.userId = userToShareWith._id;
    
    // Create the new scenario (deep copy)
    const copiedScenario = new Scenario(scenarioData);
    await copiedScenario.save();
    
    // Create a share record to track the relationship
    const newShare = new ScenarioShare({
      originalScenarioId: scenarioId,
      originalOwnerId: userId,
      copiedScenarioId: copiedScenario._id,
      sharedWithId: userToShareWith._id,
      sharedWithName: userToShareWith.name,
      sharedWithEmail: userToShareWith.email,
      permission
    });
    
    await newShare.save();
    
    res.status(200).json({
      success: true,
      message: `Scenario successfully shared with ${shareWithEmail}`
    });
  } catch (error) {
    console.error("Error sharing scenario:", error);
    res.status(500).json({
      success: false,
      message: "Failed to share scenario"
    });
  }
});

// Add a new endpoint to see scenarios you've shared with others
router.get("/shared-by-me", async (req: Request, res: Response) => {
  try {
    const user = req.user as UserDocument;
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    
    console.log("Fetching scenarios shared by user:", user._id);
    
    // Find all shares where this user is the original owner
    const shareRecords = await ScenarioShare.find({
      originalOwnerId: user._id
    });
    
    console.log("Found share records:", shareRecords.length);
    
    if (!shareRecords || shareRecords.length === 0) {
      return res.status(200).json({
        success: true,
        message: "You haven't shared any scenarios",
        data: {}
      });
    }
    
    // Group by original scenario
    const scenariosGrouped: Record<string, any[]> = {};
    
    shareRecords.forEach(share => {
      const originalId = share.originalScenarioId.toString();
      if (!scenariosGrouped[originalId]) {
        scenariosGrouped[originalId] = [];
      }
      
      scenariosGrouped[originalId].push({
        userId: share.sharedWithId,
        userName: share.sharedWithName || share.sharedWithEmail,
        email: share.sharedWithEmail,
        permission: share.permission,
        sharedAt: share.createdAt,
        copiedScenarioId: share.copiedScenarioId
      });
    });
    
    console.log("Scenarios grouped by original ID:", Object.keys(scenariosGrouped).length);
    
    // Get the original scenario details
    const result = await Promise.all(
      Object.keys(scenariosGrouped).map(async (originalId) => {
        try {
          const originalScenario = await Scenario.findById(originalId);
          if (!originalScenario) {
            console.log("Original scenario not found:", originalId);
            return null;
          }
          
          return {
            _id: originalScenario._id,
            name: originalScenario.name || "Unnamed Scenario",
            maritalStatus: originalScenario.maritalStatus || "Not specified",
            residenceState: originalScenario.residenceState || "Not specified",
            createdAt: originalScenario.createdAt || new Date(),
            sharedWith: scenariosGrouped[originalId]
          };
        } catch (err) {
          console.error("Error processing original scenario:", err);
          return null;
        }
      })
    );
    
    // Filter out nulls (in case a scenario was deleted)
    const filteredResult = result.filter(item => item !== null);
    
    console.log("Final shared-by-me scenarios count:", filteredResult.length);
    
    res.status(200).json({
      success: true,
      message: "Scenarios shared by you retrieved successfully",
      data: filteredResult
    });
  } catch (error: any) {
    console.error("Error fetching scenarios shared by you:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to retrieve shared scenarios",
      error: error.message || "Unknown error"
    });
  }
});

// Replace the existing revoke-access endpoint
router.post("/revoke-access", async (req: Request, res: Response) => {
  try {
    const user = req.user as UserDocument;
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    
    const currentUserId = user._id as mongoose.Types.ObjectId;
    const { scenarioId, userId: targetUserId } = req.body;
    
    // Validate required fields
    if (!scenarioId || !targetUserId) {
      return res.status(400).json({
        success: false,
        message: "Scenario ID and user ID are required"
      });
    }
    
    // Find the original scenario and check ownership
    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: "Scenario not found"
      });
    }
    
    if (scenario.userId.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only manage sharing for scenarios you own"
      });
    }
    
    // Find the share record
    const shareRecord = await ScenarioShare.findOne({
      originalScenarioId: scenarioId,
      sharedWithId: targetUserId
    });
    
    if (!shareRecord) {
      return res.status(404).json({
        success: false,
        message: "Share record not found"
      });
    }
    
    // Delete the copied scenario
    await Scenario.findByIdAndDelete(shareRecord.copiedScenarioId);
    
    // Delete the share record
    await ScenarioShare.findByIdAndDelete(shareRecord._id);
    
    res.status(200).json({
      success: true,
      message: "Access successfully revoked and copied scenario deleted"
    });
  } catch (error) {
    console.error("Error revoking access:", error);
    res.status(500).json({
      success: false,
      message: "Failed to revoke access"
    });
  }

  //for user to load one scenario
//so then he/she can edit it or continue working on it.
router.get("/:id", checkScenarioAccess, async (req: Request, res: Response) => {
  try {
    const scenario = (req as any).scenario;
    const permission = (req as any).userPermission;

    res.json({
      success: true,
      message: "Scenario retrieved successfully",
      data: scenario,
      permission: permission
    });
  } catch (error) {
    console.error("Error retrieving scenario:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to retrieve scenario" 
    });
  }
});

//delete scenario - only the owner should be able to delete
router.delete("/:id", checkScenarioAccess, async (req: Request, res: Response) => {
  try {
    const user = req.user as UserDocument;
    const permission = (req as any).userPermission;
    
    // Only the owner can delete a scenario
    if (permission !== 'owner') {
      return res.status(403).json({ 
        success: false, 
        message: "Only the owner can delete a scenario" 
      });
    }

    const deletedScenario = await Scenario.findOneAndDelete({
      _id: req.params.id,
      userId: user._id
    });

    if (!deletedScenario) {
      return res.status(404).json({ 
        success: false, 
        message: "Scenario not found or unauthorized" 
      });
    }

    // Find all shares where this is the original scenario
    const shares = await ScenarioShare.find({ originalScenarioId: req.params.id });
    
    // Delete all copied scenarios
    for (const share of shares) {
      await Scenario.findByIdAndDelete(share.copiedScenarioId);
    }
    
    // Delete all shares associated with this scenario
    await ScenarioShare.deleteMany({ originalScenarioId: req.params.id });
    
    // Also check if this was a copied scenario and delete the share record
    await ScenarioShare.deleteMany({ copiedScenarioId: req.params.id });

    res.json({ 
      success: true, 
      message: "Scenario deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting scenario:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete scenario" 
    });
  }
});

});

export default router;