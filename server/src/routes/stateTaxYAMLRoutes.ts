import express, { Request, Response } from "express";
import { IStateTaxBracket } from "../db/models/StateTaxBracket";
import { StateType, TaxFilingStatus } from "../core/Enums";

const router = express.Router();

// AI-generated code
// Parse string YAML array into structured objects grouped by taxpayer type

interface GroupedTaxData {
  taxpayer_type: TaxFilingStatus;
  resident_state: StateType;
  brackets: Array<{
    min: number;
    max: number | null;
    rate: number;
  }>;
}

function parse_state_tax_yaml(yamlString: string): GroupedTaxData[] {
  try {
    // Parse the string into an array of objects
    const parsedArray: IStateTaxBracket[] = JSON.parse(yamlString);

    // Group by taxpayer_type and resident_state
    const groupedData: Record<string, GroupedTaxData> = {};

    parsedArray.forEach((bracket: IStateTaxBracket) => {
      const key = `${bracket.taxpayer_type}_${bracket.resident_state}`;

      if (!groupedData[key]) {
        groupedData[key] = {
          taxpayer_type: bracket.taxpayer_type,
          resident_state: bracket.resident_state,
          brackets: [],
        };
      }

      groupedData[key].brackets.push({
        min: bracket.min,
        max: bracket.max,
        rate: bracket.rate,
      });
    });

    // Convert to array format
    return Object.values(groupedData);
  } catch (error) {
    console.error("Error parsing tax YAML:", error);
    throw new Error("Failed to parse tax data");
  }
}

router.post("/", (req: Request, res: Response) => {
  try {
    const yamlArray = req.body;

    // Parse and structure the data
    const structuredData = parse_state_tax_yaml(yamlArray);

    console.log("structuredData:", structuredData);

    return res.status(200).json({
      success: true,
      message: "State tax data processed successfully",
      data: structuredData,
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
