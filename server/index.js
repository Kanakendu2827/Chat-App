import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { dirname } from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import messagesRoutes from "./routes/messages.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: `${__dirname}/.env` });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/login_db";
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

if (!process.env.MONGODB_URI) {
  console.warn(
    "MONGODB_URI is not set. Falling back to local MongoDB at mongodb://127.0.0.1:27017/login_db"
  );
}

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://chat-app-dz1c.vercel.app",
    ],
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "100mb" }));
app.use(
  express.urlencoded({
    limit: "100mb",
    extended: true,
  })
);

// Logger
app.use((req, res, next) => {
  console.log(
    new Date().toISOString(),
    req.method,
    req.originalUrl
  );
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/messages", messagesRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });