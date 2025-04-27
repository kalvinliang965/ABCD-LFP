// AI-generated code
// Create tax routes and controller in one file

import express, { Request, Response } from "express";
import { StateType } from "../core/Enums";
import { state_taxbrackets_exist_in_db } from "../db/repositories/StateTaxBracketRepository";
import { simulation_logger } from "../utils/logger/logger";

const router = express.Router();

/**
 * @route   GET /api/tax/:state
 * @desc    Check if state tax brackets exist for a given state
 * @access  Public
 */
router.get("/:state", async (req: Request, res: Response) => {
  try {
    const { state } = req.params;
    console.log("Checking if state tax brackets exist for:", state);

    if (!state || !Object.values(StateType).includes(state as StateType)) {
      res.status(400).json({ error: "Invalid state provided" });
      return;
    }

    const exists = await state_taxbrackets_exist_in_db(state as StateType);

    simulation_logger.info(`Checked tax brackets for state ${state}`, {
      exists,
    });

    res.status(200).json({ exists });
  } catch (error) {
    simulation_logger.error("Error checking state tax brackets", {
      error: error instanceof Error ? error.stack : error,
    });

    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
