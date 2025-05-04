import mongoose, { Schema, Document } from 'mongoose';

export interface IScenarioShare extends Document {
  originalScenarioId: mongoose.Types.ObjectId;  // Original scenario ID
  originalOwnerId: mongoose.Types.ObjectId;     // Original owner
  originalOwnerName?: string;                   // Original owner's name
  copiedScenarioId: mongoose.Types.ObjectId;    // The copy's ID
  sharedWithId: mongoose.Types.ObjectId;        // User who received the copy
  sharedWithName?: string;                      // Recipient's name
  sharedWithEmail: string;                      // Recipient's email
  permission: 'read' | 'write';                 // The permission level
  createdAt: Date;
  updatedAt: Date;
}

const ScenarioShareSchema: Schema = new Schema({
  originalScenarioId: { type: Schema.Types.ObjectId, ref: 'Scenario', required: true },
  originalOwnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  originalOwnerName: { type: String },
  copiedScenarioId: { type: Schema.Types.ObjectId, ref: 'Scenario', required: true },
  sharedWithId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWithName: { type: String },
  sharedWithEmail: { type: String, required: true },
  permission: { type: String, enum: ['read', 'write'], default: 'read', required: true }
}, {
  timestamps: true
});

// Create a compound index to ensure uniqueness of original scenario + shared user combination
ScenarioShareSchema.index({ originalScenarioId: 1, sharedWithId: 1 }, { unique: true });

export default mongoose.model<IScenarioShare>('ScenarioShare', ScenarioShareSchema); 