import express from "express";
import { Request, Response } from "express";
import Scenario from "../db/models/Scenario";
import { authenticateJWT } from "../middleware/auth.middleware";
import { UserDocument } from "../db/models/User";

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

router.put("/:id", async (req: Request, res: Response) => {
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
    //merge the new data with the user’s _id
    const scenario_id = req.params.id;

    //ai generated console.logs:
    //promt: please write the console log statements for monitoring isDraft changes 
    console.log("PUT /:id - Request body:", req.body);
    console.log("PUT /:id - isDraft from request:", req.body.isDraft);
    
    const scenario_data = {
      ...req.body,
      userId: user._id,
      isDraft: req.body.isDraft ?? true // Use isDraft consistently
    };
    
    //ai generated console.logs:
    //promt: please write the console log statements for monitoring isDraft changes
    console.log("PUT /:id - Final scenario data:", scenario_data);
    console.log("PUT /:id - Final isDraft value:", scenario_data.isDraft);

    //using findOneAndUpdate to update the scenario
    const updated_scenario = await Scenario.findOneAndUpdate(
      { _id: scenario_id, userId: user._id },
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

//for user to load one scenario
//so then he/she can edit it or continue working on it.
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = req.user as UserDocument;
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    const scenario = await Scenario.findOne({
      _id: req.params.id,
      userId: user._id
    });

    if (!scenario) {
      return res.status(404).json({ 
        success: false, 
        message: "Scenario not found or unauthorized" 
      });
    }

    res.json({
      success: true,
      message: "Scenario retrieved successfully",
      data: scenario
    });
  } catch (error) {
    console.error("Error retrieving scenario:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to retrieve scenario" 
    });
  }
});

//elete scenario
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const user = req.user as UserDocument;
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }

    const deleted_scenario = await Scenario.findOneAndDelete({
      _id: req.params.id,
      userId: user._id
    });

    if (!deleted_scenario) {
      return res.status(404).json({ 
        success: false, 
        message: "Scenario not found or unauthorized" 
      });
    }

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

export default router;