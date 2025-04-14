// src/middleware.ts

import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import express, { Express } from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import { database_config } from "./config/database";
import { api_config } from "./config/api";
import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from "./db/models/User";

let sessionStore: MongoStore;

function initialize_middlewares(app: Express) {
    console.log("Registering global middleware");

    const minute = 60 * 1000;
    const sessionStore = MongoStore.create({ mongoUrl: database_config.MONGO_URL});


    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    // added this so express can understand yaml
    app.use(bodyParser.text({
        type: ["application/x-yaml", "text/yaml"],
        limit: "10mb"
    }));
    app.use(cookieParser());
    app.use(cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(session({
        secret: process.env.SESSION_SECRET || "do work!!",
        cookie: { 
            httpOnly: true, 
            maxAge: 60 * minute,
            sameSite: "lax" 
        },
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    // passport.use(
    //     new GoogleStrategy(
    //       {
    //         clientID: process.env.GOOGLE_CLIENT_ID!,
    //         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    //         callbackURL: "/auth/google/callback",
    //       },
    //       async (accessToken, refreshToken, profile, done) => {
    //         // You would query your DB here and find or create the user
    //         return done(null, profile); // Store the whole profile or a user object
    //       }
    //     )
    //   );
      
      // Optional if using sessions
      passport.serializeUser((user, done) => {
        done(null, user); // Or user.id if storing user in DB
      });
      
      passport.deserializeUser((obj: any, done) => {
        done(null, obj);
    });

    passport.use(
        new GoogleStrategy(
          {
            clientID: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackURL: "/auth/google/callback",
            proxy: true
          },
          async (accessToken, refreshToken, profile, done) => {
            try {
              //console.log("Google profile:", profile.id);
              
              // Check if user already exists
              const existingUser = await User.findOne({ googleId: profile.id });
              
              if (existingUser) {
               // console.log("Existing user found:", existingUser._id);
                return done(null, existingUser);
              }
              
              // Create new user
              //console.log("Creating new user...");
              const newUser = new User({
                userId: `user_${Math.random().toString(36).substr(2, 9)}`,
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails?.[0]?.value || '',
                profilePicture: profile.photos?.[0]?.value || ''
              });
              
              // Save user to database
              await newUser.save();
              //console.log("New user saved with ID:", newUser._id);
              
              // Return the new user
              done(null, newUser);
            } catch (error) {
              console.error("Error in Google strategy:", error);
              done(error, false);
            }
          }
        )
      );




    // profiling
    app.use((req, res, next) => {
        const start = process.hrtime(); // High-resolution time
        res.on("finish", () => { // When response is sent
          const end = process.hrtime(start);
          const elapsedMs = end[0] * 1000 + end[1] / 1e6; // Convert to ms
          console.log(`${req.method} ${req.url} took ${elapsedMs.toFixed(2)}ms`);
        });
        next();
    });
      
    console.log("Finish registering global middleware");
}
export { sessionStore, initialize_middlewares }
