import dotenv from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";
import app from "../server/app.js";
import connectDB from "../server/database.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: `${__dirname}/../server/.env` });

let connected = false;

export default async function handler(req, res) {
  try {
    if (!connected) {
      await connectDB();
      connected = true;
    }

    return app(req, res);
  } catch (error) {
    console.error("API handler startup error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Server startup failed. Check MONGODB_URI and database connectivity.",
        error: error.message,
      });
    }
  }
}
