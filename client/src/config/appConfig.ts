export const appConfig = {
    api: {
        baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    },
    dev: {
        port: parseInt(import.meta.env.VITE_PORT || "5713", 10),
    }

}

export type AppConfig = typeof appConfig;