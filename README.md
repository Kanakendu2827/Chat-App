# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Backend Setup

This project now includes an Express backend for authentication and MongoDB storage.

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI` to your MongoDB connection string, for example:

   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/login_db
   JWT_SECRET=your_strong_secret_here
   PORT=5000
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the backend server:

   ```bash
   npm run server
   ```

5. Start the Vite frontend:

   ```bash
   npm run dev
   ```

The frontend sends login and signup requests to `/api/auth/login` and `/api/auth/signup` through the Vite proxy.

## Vercel Deployment (frontend)

If you deploy the frontend to Vercel you will need to point API calls to a running backend. The app uses `VITE_API_BASE` at build time when present, and falls back to relative `/api/...` paths (for local Vite proxy). Steps:

1. Deploy your backend (recommended: Render, Railway, Fly, Heroku, or a separate Vercel project using Serverless Functions).
2. In the Vercel dashboard for the frontend project, set the Environment Variable `VITE_API_BASE` to your backend URL (for example `https://my-backend.example.com`).
3. Redeploy the frontend project on Vercel so the build picks up the environment variable.

Example: if your backend is at `https://api.example.com`, set `VITE_API_BASE=https://api.example.com`.

Notes & troubleshooting
- We replaced the native `bcrypt` dependency in the server with `bcryptjs` to avoid native build issues on Vercel (see `server/package.json`).
- If you previously saw `No matching version found for jsonwebtoken@^9.1.1`, we pinned `jsonwebtoken` to a published version (`^9.0.2`) in `package.json`.
- If Vercel returns HTML (404 page) instead of JSON, the frontend receives non-JSON and you'll see parse errors. That indicates the API endpoint path is wrong or the backend isn't reachable.

Quick redeploy via Vercel CLI (optional):

```bash
# set env (interactive)
vercel env add VITE_API_BASE production

# trigger a deploy (empty commit)
git commit --allow-empty -m "Trigger Vercel redeploy" && git push
```

If you'd like, I can also:
- Deploy the backend to a free host and return a ready `VITE_API_BASE` value, or
- Convert server routes into Vercel Serverless Functions inside `api/` so frontend + backend live in one Vercel project.

