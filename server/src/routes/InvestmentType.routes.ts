import express, { Request, Response } from "express";
import InvestmentType from "../db/models/InvestmentType.model";

const router = express.Router();

const defaultUserId = "66f4f2a6f032392868a3eba3";

/**
 * @route   POST /api/investments
 * @desc    Create a new investment type
 * @access  Public (for now)
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    //const currentUser = req.user._id;

    const investmentTypeData = req.body;
    //TODO: 需要修改，现在默认是admin的id
    investmentTypeData.userId = defaultUserId;

    const doc = await InvestmentType.create(investmentTypeData);

    res.status(201).json(doc);
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
    //TODO: 需要修改，现在默认是admin的id
    const investmentTypes = await InvestmentType.find({
      userId: defaultUserId,
    }).sort({ name: 1 });

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
    //TODO: 需要修改，现在默认是admin的id
    const investmentType = await InvestmentType.findById(req.params.id, {
      userId: defaultUserId,
    });

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
