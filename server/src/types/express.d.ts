import { Express } from "express";
import { User } from "../db/models/User";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
