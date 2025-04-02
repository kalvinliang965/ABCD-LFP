import mongoose, { Schema, Document, CallbackError } from 'mongoose';
import bcrypt from 'bcrypt';

// Combine both interfaces
export interface UserDocument extends Document {
  userId: string;
  name: string;
  email: string;
  password: string;
  googleId?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
  scenarios: Array<{
    name: string;
    description: string;
    createdAt: Date;
    sharedWith: mongoose.Types.ObjectId[];
  }>;
  yamlFiles: Array<{
    name: string;
    content: string;
    createdAt: Date;
  }>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    default: () => `user_${Math.random().toString(36).substr(2, 9)}`
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function(this: any): boolean {
      return !this.googleId; // Password required only if not using Google auth
    },
    minlength: 6
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null/undefined values
  },
  profilePicture: {
    type: String
  },
  scenarios: [
    {
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      sharedWith: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
  ],
  yamlFiles: [
    {
      name: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  const user = this;
  
  // Only hash the password if it's modified or new
  if (!user.isModified('password')) return next();
  
  try {
    // Check if password exists
    if (!user.password) {
      return next(new Error('Password is required'));
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    next();
  } catch (error) {
    next(error as mongoose.CallbackError);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    // If user has no password (Google auth), return false
    if (!this.password) return false;
    
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Check if the model exists before creating it
export default mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema); 