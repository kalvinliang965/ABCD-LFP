import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Scenario from '../db/models/Scenario';
import ScenarioShare from '../db/models/ScenarioShare';
import { UserDocument } from '../db/models/User';

// Define custom request interface with user permission and scenario
interface RequestWithPermission extends Request {
  userPermission?: 'owner' | 'read' | 'write';
  scenario?: any;
}

/**
 * Middleware to check if a user has access to a scenario
 * Sets req.userPermission to 'owner', 'read', or 'write' based on access level
 * Sets req.scenario to the scenario document
 */
export const checkScenarioAccess = async (
  req: RequestWithPermission, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const user = req.user as UserDocument;
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated' 
      });
    }

    // Ensure user._id is treated as a valid ObjectId
    const userId = user._id as mongoose.Types.ObjectId;

    const scenarioId = req.params.id || req.body.scenarioId;
    if (!scenarioId) {
      return res.status(400).json({
        success: false,
        message: 'Scenario ID required'
      });
    }

    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: 'Scenario not found'
      });
    }

    // Check if user is the owner of this scenario
    if (scenario.userId.toString() === userId.toString()) {
      req.userPermission = 'owner';
      req.scenario = scenario;
      return next();
    }

    // If user is not the owner but is trying to access, check if this is a copied scenario
    // Find corresponding share record
    const shareRecord = await ScenarioShare.findOne({
      $or: [
        // Check if this is an original scenario that was shared
        { originalScenarioId: scenarioId },
        // Or if this is a copied scenario
        { copiedScenarioId: scenarioId }
      ]
    });

    if (shareRecord) {
      // If this is a copied scenario that belongs to the current user
      if (shareRecord.copiedScenarioId.toString() === scenarioId && 
          shareRecord.sharedWithId.toString() === userId.toString()) {
        req.userPermission = shareRecord.permission;
        req.scenario = scenario;
        return next();
      }
    }

    // If no access was found, deny access
    return res.status(403).json({
      success: false,
      message: 'You do not have access to this scenario'
    });
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking permissions'
    });
  }
};

/**
 * Middleware to check if a user has write access to a scenario
 * Must be used after checkScenarioAccess
 */
export const requireWriteAccess = (
  req: RequestWithPermission, 
  res: Response, 
  next: NextFunction
) => {
  const permission = req.userPermission;
  
  if (permission === 'owner' || permission === 'write') {
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: 'You do not have permission to modify this scenario'
  });
}; 