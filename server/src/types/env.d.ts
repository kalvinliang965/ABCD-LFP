declare namespace NodeJS {
    interface ProcessEnv {
        NODE_DEV: "development" | "production" | "test";
        MONGODB_URL: string;
        API_URL: string;
        GOOGLE_CLIENT_ID: string;
        GOOGLE_CLIENT_SECRET: string;
        SESSION_SECRET: string;
        CLIENT_URL: string;
    }
}