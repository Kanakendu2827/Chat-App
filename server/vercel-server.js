import serverless from "serverless-http";
import dotenv from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import connectDB from "./database.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: `${__dirname}/.env` });

let connected = false;
const handler = async (req, res) => {
  if (!connected) {
    await connectDB();
    connected = true;
  }
  return app(req, res);
};

export const api = serverless(handler);
