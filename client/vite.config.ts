import { defineConfig, loadEnv, UserConfigExport } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ["VITE_"]);

  const config: UserConfigExport = {
    server: {
      port: parseInt(env.VITE_PORT, 10) || 5713,
    },
    preview: {
      port: parseInt(env.VITE_PORT, 10) || 5713,
    }
  }

  return config;
})

