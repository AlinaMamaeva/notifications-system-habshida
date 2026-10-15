
import "dotenv/config";
import express from "express";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";

import { connectDB } from "./db/mongo.js";
import authRouter from "./routes/auth.js";
import { setupSocket } from "./socket/index.js";
import { createNotificationsRouter } from "./routes/notifications.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

setupSocket(io);

// Middleware
app.use(express.json());

// Подключаем папку public
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.resolve(__dirname, "../public")));

// API routes
app.use("/api/auth", authRouter);
app.use("/api/notifications", createNotificationsRouter(io));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
