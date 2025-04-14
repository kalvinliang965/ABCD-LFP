import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../db/models/User';

// Make sure this matches exactly what's in your .env file
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret';


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



// export const protect = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // Check if user is authenticated via session (for Google OAuth)
//     if (req.isAuthenticated && req.isAuthenticated()) {
//         console.log("✅ Authenticated via session:", req.user);
//         return next();
//       }

//       const authHeader = req.headers.authorization;
//       if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(401).json({ message: 'No token provided' });
//       }
    
//     // Check for JWT token in headers
//     let token;
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//       token = req.headers.authorization.split(' ')[1];
//     }
    
//     if (!token) {
//       return res.status(401).json({ message: 'Not authorized, no token' });
//     }
    
//     console.log('Token received:', token.substring(0, 10) + '...');
    
//     try {
//       // Verify token
//       const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
//       console.log('Token decoded successfully:', decoded);
      
//       // Find user - try both userId and _id
//       const user = await User.findById(decoded.userId || decoded._id || decoded.id);
      
//       if (!user) {
//         console.log('User not found for decoded token:', decoded);
//         return res.status(401).json({ message: 'Not authorized, user not found' });
//       }
      
//       // Add user to request
//       req.user = user;
      
//       next();
//     } catch (jwtError) {
//       console.error('JWT verification error:', jwtError);
//       return res.status(401).json({ message: 'Not authorized, token invalid' });
//     }
//   } catch (error) {
//     console.error('Auth middleware error:', error);
//     res.status(401).json({ message: 'Not authorized, token failed' });
//   }
// };

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // ✅ Step 1: Handle session-based auth (Google login)
      if (req.isAuthenticated && req.isAuthenticated()) {
        console.log("✅ Authenticated via session:", req.user);
        return next();
      }
  
      // ✅ Step 2: Handle JWT-based auth (traditional login)
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }
  
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
  
      const user = await User.findById(decoded.userId || decoded.id || decoded._id);
      if (!user) {
        return res.status(401).json({ message: 'Invalid token' });
      }
  
      req.user = user;
      next();
    } catch (error) {
      console.error('❌ Auth middleware error:', error);
      return res.status(401).json({ message: 'Authentication failed' });
    }
  };
  
export const authenticateJWT = protect; 