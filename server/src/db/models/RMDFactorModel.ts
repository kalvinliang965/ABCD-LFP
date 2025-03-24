import mongoose from 'mongoose';

// Define the schema
const rmdFactorSchema = new mongoose.Schema({
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 120,
    unique: true
  },
  distributionPeriod: {
    type: Number,
    required: true,
    min: 1
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the model
const RMDFactorModel = mongoose.model('RMDFactor', rmdFactorSchema);

export default RMDFactorModel; 