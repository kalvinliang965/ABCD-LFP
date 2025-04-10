import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../db/models/User';

interface DecodedToken {
  id: string;
  email: string;
  iat: number;
  exp: number;
  userId: string;
  _id: string;
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

// Make sure this matches exactly what's in your .env file
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret';

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
    
    console.log('Token received:', token.substring(0, 10) + '...');
    
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      console.log('Token decoded successfully:', decoded);
      
      // Find user - try both userId and _id
      const user = await User.findById(decoded.userId || decoded._id || decoded.id);
      
      if (!user) {
        console.log('User not found for decoded token:', decoded);
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      // Add user to request
      req.user = user;
      
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const authenticateJWT = protect; 