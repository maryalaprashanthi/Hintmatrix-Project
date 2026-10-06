const normalizeOrigin = (value) => value?.trim().replace(/\/+$/, "");

const resolveBackendOrigin = () => {
  const modeMap = {
    development:
      import.meta.env.VITE_API_BASE_URL_DEV ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:8080",
    staging: import.meta.env.VITE_API_BASE_URL_STAGING || import.meta.env.VITE_API_BASE_URL || "",
    production: import.meta.env.VITE_API_BASE_URL_PROD || import.meta.env.VITE_API_BASE_URL || "",
  };

  return normalizeOrigin(modeMap[import.meta.env.MODE] || modeMap.development || "");
};

// Use the backend origin only; service paths already include /api.
export const BACKEND_BASE_URL = resolveBackendOrigin();

export const backendUrl = (path) =>
  `${BACKEND_BASE_URL}/${path.replace(/^\/+/, "")}`;
