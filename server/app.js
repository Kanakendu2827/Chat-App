import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import messagesRoutes from "./routes/messages.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://chat-app-dz1c.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "100mb" }));
app.use(
  express.urlencoded({
    limit: "100mb",
    extended: true,
  })
);

app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
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

export default app;
