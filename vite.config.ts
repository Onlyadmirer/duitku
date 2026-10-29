import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    server: env.VITE_API_PROXY
      ? {
          proxy: {
            "/api": {
              target: env.VITE_API_PROXY,
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined,
  };
});
