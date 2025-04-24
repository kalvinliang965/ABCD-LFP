import express from "express";
import { Request, Response } from "express";
import Scenario from "../db/models/Scenario";
import { authenticateJWT } from "../middleware/auth.middleware";

const router = express.Router();

router.use(authenticateJWT);

router.post("/", async (req: Request, res: Response) => {
  try {
    const { scenarioId, count } = req.body;

    //check if the scenario exists
    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: "Scenario not found",
      });
    }
    console.log("Simulation request received for scenario:", scenario);
    console.log("Requested", count, "simulations");

    //catch any errors
  } catch (error) {
    console.error("Error running simulation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to run simulation",
    });
  }
});

export default router;
