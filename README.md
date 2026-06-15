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
