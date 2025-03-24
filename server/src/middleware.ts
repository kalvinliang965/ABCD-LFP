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

const sessionStore = MongoStore.create({ mongoUrl: database_config.MONGO_URL});

function registerGlobalMiddleWare(app: Express) {
    console.log("Registering global middleware");

    const minute = 60 * 1000;

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
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
    console.log("Finish registering global middleware");
}

export { sessionStore, registerGlobalMiddleWare }