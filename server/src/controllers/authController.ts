import { Request, Response } from 'express';
import User, { UserDocument } from '../db/models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Get JWT secret from environment variables or use a default (for development only)
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret'

/**
 * Authentication Controllers
 */
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    console.log("Received signup request:", { email, name });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Create new user - let the pre-save hook handle password hashing
    const user = new User({
      email,
      password, // Add the password back!
      name
    });
    
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set up session for the user
    if (req.login) {
      req.login(user, (err) => {
        if (err) {
          console.error("Error during login after signup:", err);
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        password: user.password
      },
      redirectUrl: '/scenarios'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating user' 
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
    return res.status(401).json({ 
        success: false, 
        message: 'Email not found' 
    });
    }

    // Check password

    //console.log("Checking password for user:", password);
    //console.log("User password:", user.password);
    //console.log("Raw email:", `"${email}"`);
    //console.log("Raw password input:", `"${password}"`);
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
    return res.status(401).json({ 
        success: false, 
        message: 'Incorrect password' 
    });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set up session for the user
    if (req.login) {
      req.login(user, (err) => {
        if (err) {
          console.error("Error during login:", err);
          return res.status(500).json({
            success: false,
            message: 'Error during login'
          });
        
        }

        res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      },
      redirectUrl: '/scenarios'
    });
    
      });
    }

    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error during login' 
    });
  }
};

export const guestLogin = async (req: Request, res: Response) => {
  try {
    // Generate a random guest ID
    const randomId = Math.random().toString(36).substring(2, 15);
    const guestEmail = `guest-${randomId}@guest.com`;
    const guestName = `Guest-${randomId.substring(0, 4)}`;
    
    // Generate a random password
    const guestPassword = Math.random().toString(36).substring(2, 12);
    
    // Create a new user with guest flag
    const guestUser = new User({
      email: guestEmail,
      password: guestPassword, // Will be hashed by pre-save hook
      name: guestName,
      isGuest: true // Add this field to your User schema
    });
    
    await guestUser.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: guestUser._id, email: guestUser.email, isGuest: true },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Set up session for the user
    if (req.login) {
      req.login(guestUser, (err) => {
        if (err) {
          console.error("Error during guest login:", err);
          return res.status(500).json({
            success: false,
            message: 'Error during guest login'
          });
        }
        
        res.json({
          success: true,
          message: 'Guest login successful',
          token,
          user: {
            id: guestUser._id,
            email: guestUser.email,
            name: 'Guest',
            isGuest: true
          },
          redirectUrl: '/scenarios'
        });
      });
    } else {
      res.json({
        success: true,
        message: 'Guest login successful',
        token,
        user: {
          id: guestUser._id,
          email: guestUser.email,
          name: 'Guest',
          isGuest: true
        },
        redirectUrl: '/scenarios'
      });
    }
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating guest account'
    });
  }
};

/**
 * User Controllers
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // User should be attached to request by auth middleware
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    console.log("Current user:", req.user);
    res.json(req.user);
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    // @ts-ignore - Assuming req.user has _id
    const userId = req.user._id;
    
    // Don't allow password updates through this endpoint
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    // @ts-ignore - Assuming req.user has _id
    const userId = req.user._id;
    
    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Generate JWT token
const generateToken = (user: UserDocument) => {
    return jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
  };
  
  // Get user profile
  export const getUserProfile = async (req: Request, res: Response) => {
    try {
      // @ts-ignore - Add user from auth middleware
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  
  
  // Register new user
//   export const registerUser = async (req: Request, res: Response) => {
//     try {
//       const { name, email, password } = req.body;
      
//       // Check if user already exists
//       const existingUser = await User.findOne({ email });
//       if (existingUser) {
//         return res.status(400).json({ message: 'User already exists' });
//       }
      
//       // Create new user
//       const user = new User({
//         name,
//         email,
//         password
//       });
      
//       await user.save();
      
//       // Generate token
//       const token = generateToken(user);
      
//       res.status(201).json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         token
//       });
//     } catch (error) {
//       console.error('Error registering user:', error);
//       res.status(500).json({ message: 'Server error' });
//     }
//   };
  
  // Login user
  export const loginUser = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate token
      const token = generateToken(user);
      
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token
      });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }; 