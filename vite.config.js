import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";

const normalizeOrigin = (value) => value?.trim().replace(/\/+$/, "");

const resolveBackendOrigin = (env, mode) => {
  const modeMap = {
    development: env.VITE_API_BASE_URL_DEV || env.VITE_API_BASE_URL,
    staging: env.VITE_API_BASE_URL_STAGING || env.VITE_API_BASE_URL,
    production: env.VITE_API_BASE_URL_PROD || env.VITE_API_BASE_URL,
  };

  return normalizeOrigin(modeMap[mode] || env.VITE_API_BASE_URL || "");
};

const validateOrigin = (backendOrigin, keyName) => {
  if (!backendOrigin) {
    return;
  }

  const url = new URL(backendOrigin);

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error(
      `${keyName} must be an HTTP(S) origin without /api, credentials, or query parameters.`,
    );
  }
};

// https://vitejs.dev
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const backendOrigin = resolveBackendOrigin(env, mode);

  if (command === "build" && !backendOrigin) {
    throw new Error(
      "Set VITE_API_BASE_URL (or a mode-specific VITE_API_BASE_URL_DEV/STAGING/PROD) before building.",
    );
  }

  validateOrigin(backendOrigin, "VITE_API_BASE_URL");

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // Intercepts all paths starting with /api and routes them to Spring Boot.
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
