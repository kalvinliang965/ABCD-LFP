import express, { Request, Response } from "express";
import InvestmentType, {
  IInvestmentType,
} from "../db/models/InvestmentType.model";

const router = express.Router();

/**
 * @route   POST /api/investments
 * @desc    Create a new investment type
 * @access  Public (for now)
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const investmentTypeData = req.body;

    // Create new investment type
    const newInvestmentType = new InvestmentType(investmentTypeData);

    // Save to database
    const savedInvestmentType = await newInvestmentType.save();

    res.status(201).json(savedInvestmentType);
  } catch (error) {
    console.error("Error creating investment type:", error);

    // Mongoose validation error
    if (error instanceof Error && error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation Error",
        message: error.message,
      });
    }

    // Duplicate key error
    if (
      error instanceof Error &&
      error.name === "MongoError" &&
      (error as any).code === 11000
    ) {
      return res.status(400).json({
        error: "Duplicate Error",
        message: "An investment type with this name already exists",
      });
    }

    res.status(500).json({
      error: "Server Error",
      message: "An unexpected error occurred",
    });
  }
});

/**
 * @route   GET /api/investments
 * @desc    Get all investment types
 * @access  Public (for now)
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const investmentTypes = await InvestmentType.find().sort({ name: 1 });
    res.status(200).json(investmentTypes);
  } catch (error) {
    console.error("Error fetching investment types:", error);
    res.status(500).json({
      error: "Server Error",
      message: "An unexpected error occurred while fetching investment types",
    });
  }
});

/**
 * @route   GET /api/investments/:id
 * @desc    Get investment type by ID
 * @access  Public (for now)
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const investmentType = await InvestmentType.findById(req.params.id);

    if (!investmentType) {
      return res.status(404).json({
        error: "Not Found",
        message: "Investment type not found",
      });
    }

    res.status(200).json(investmentType);
  } catch (error) {
    console.error("Error fetching investment type:", error);

    // Invalid ID format
    if (error instanceof Error && error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid ID",
        message: "Invalid investment type ID format",
      });
    }

    res.status(500).json({
      error: "Server Error",
      message:
        "An unexpected error occurred while fetching the investment type",
    });
  }
});

export default router;
