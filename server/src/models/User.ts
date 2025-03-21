import mongoose from "mongoose";

// Define a schema for scenarios
const scenarioSchema = new mongoose.Schema({
  name: String,
  data: Object, // or a more specific schema
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  permissions: { type: String, enum: ['read', 'write'], default: 'read' },
});

// Define a schema for YAML files
const yamlFileSchema = new mongoose.Schema({
  filename: String,
  content: String,
});

// Define the user schema
const userSchema = new mongoose.Schema({
  googleId: String,
  email: String,
  name: String,
  scenarios: [scenarioSchema],
  yamlFiles: [yamlFileSchema],
});

export default mongoose.model("User", userSchema); 