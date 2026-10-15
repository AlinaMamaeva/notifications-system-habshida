import type { Server } from "socket.io";
import { Notification } from "../models/Notification.js";
import { setupSocketAuth } from "../middleware/socketAuth.js";

export function setupSocket(io: Server): void {
  setupSocketAuth(io);

  io.on("connection", async (socket) => {
    const userId = socket.data.userId as string;

    await socket.join(`user:${userId}`);

    console.log(`User ${userId} connected`);

    try {
      const unread = await Notification.countDocuments({
        userId,
        read: false,
      });

      socket.emit("notification:count", { unread });
    } catch (error) {
      console.error("Failed to count notifications:", error);
    }

    socket.on("notification:ping", () => {
      socket.emit("notification:pong");
    });

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected`);
    });
  });
}