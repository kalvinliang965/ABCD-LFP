import mongoose from "mongoose";

const scenarioSchema = new mongoose.Schema({
  name: String,
  data: Object, // or a more specific schema
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  permissions: { type: String, enum: ['read', 'write'], default: 'read' },
});

const yamlFileSchema = new mongoose.Schema({
  filename: String,
  content: String,
});

const userSchema = new mongoose.Schema({
  googleId: String,
  email: String,
  name: String,
  scenarios: [scenarioSchema],
  yamlFiles: [yamlFileSchema],
});

export default mongoose.model("User", userSchema); 