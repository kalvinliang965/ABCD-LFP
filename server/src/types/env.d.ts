declare namespace NodeJS {
    interface ProcessEnv {
        NODE_DEV: "development" | "production" | "test";
        MONGODB_URL: string;
        API_URL: string;
        
    }
}