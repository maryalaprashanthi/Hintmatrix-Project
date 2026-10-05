import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";

// https://vitejs.dev
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const backendOrigin = env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "");
  if (command === "build" && !backendOrigin) {
    throw new Error("Set VITE_API_BASE_URL to your backend origin before building.");
  }
  if (backendOrigin) {
    const url = new URL(backendOrigin);
    if (!["http:", "https:"].includes(url.protocol) || url.pathname !== "/" || url.search || url.hash || url.username || url.password) {
      throw new Error("VITE_API_BASE_URL must be an HTTP(S) origin without /api, credentials, or query parameters.");
    }
  }
  return {
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Intercepts all paths starting with /api and routes them to Spring Boot
      "/api": {
        target: backendOrigin || "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  css: {
    devSourcemap: true,
  },
  };
});
