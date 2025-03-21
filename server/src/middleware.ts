// src/middleware.ts

import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import express, { Express } from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import { database_config } from "./config/database";
import { api_config } from "./config/api";

const sessionStore = MongoStore.create({ mongoUrl: database_config.MONGO_URL});

function registerGlobalMiddleWare(app: Express) {
    console.log("Registering global middleware");

    const minute = 60 * 1000;

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(cors({
        origin: api_config.API_URL,
        credentials: true,
        methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(session({
        secret: "do work!!",
        cookie: { 
            httpOnly: true, 
            maxAge: 60 * minute, // an hour
            sameSite: "lax" 
        },
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
    }));
    console.log("Finish registering global middleware");
}


export { sessionStore, registerGlobalMiddleWare }