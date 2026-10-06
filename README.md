# React + Vite

## Backend URL configuration

All frontend backend requests use `src/config/backend.js` and the public
`VITE_API_BASE_URL` environment variable. Use the backend origin without `/api`.

- Local development: `npm run dev` defaults to `http://localhost:8080`.
  Copy `.env.example` to `.env.local` to override it, then restart Vite.
- Render production: set `VITE_API_BASE_URL=https://your-backend.onrender.com`
  in the frontend service's Environment settings, then rebuild and redeploy.
- Local production build: set `VITE_API_BASE_URL` in `.env.local` or your shell
  before running `npm run build`. Builds reject missing or invalid origins.

Vite embeds this URL at build time. Changing it requires a new frontend build.
Do not put secrets in `VITE_` variables; they are visible in the browser.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


I have doing the test commit
