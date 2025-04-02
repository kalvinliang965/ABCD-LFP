import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../db/models/User';

interface DecodedToken {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

interface User {
  _id: string;
  id?: string;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated via session (for Google OAuth)
    if (req.user) {
      return next();
    }
    
    // Check for JWT token in headers
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
    
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key'
    ) as DecodedToken;
    
    // Find user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    
    // Add user to request
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
}; 