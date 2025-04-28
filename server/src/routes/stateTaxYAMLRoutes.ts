import express, { Request, Response } from "express";
import { IStateTaxBracket, StateTaxBracketFields } from "../db/models/StateTaxBracket";
import { StateType, TaxFilingStatus } from "../core/Enums";
import { simulation_logger } from "../utils/logger/logger";
import { bulk_create_state_taxbrackets_in_db, delete_state_tax_brackets_by_state } from "../db/repositories/StateTaxBracketRepository";

const router = express.Router();

/**
 * * Warning: Assume yaml is in right format
 */
router.post("/", async(req: Request, res: Response) => {
  try {
    const js = req.body;

    // Parse and structure the data
    const parsed_array: StateTaxBracketFields[] = JSON.parse(js);

    console.log("structuredData:", parsed_array);

    await delete_state_tax_brackets_by_state(parsed_array[0].resident_state);
    simulation_logger.info("Removed existing state data");
    await bulk_create_state_taxbrackets_in_db(parsed_array)
    simulation_logger.info("Saved new state data");

    return res.status(200).json({
      success: true,
      message: "State tax data processed successfully",
      data: parsed_array,
    });
  } catch (error) {
    console.error("Error processing state tax data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process state tax data",
    });
  }
});

export default router;
