// Use the backend origin only; service paths already include /api.
export const BACKEND_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  (import.meta.env.DEV ? "http://localhost:8080" : "")
).replace(/\/+$/, "");

export const backendUrl = (path) =>
  `${BACKEND_BASE_URL}/${path.replace(/^\/+/, "")}`;
