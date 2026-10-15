import type { Server } from "socket.io";
import { verifyToken } from "../utils/jwt.js";

export function setupSocketAuth(io: Server): void {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (typeof token !== "string" || !token) {
      return next(new Error("Unauthorized"));
    }

    try {
      const userId = verifyToken(token);
      socket.data.userId = userId;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });
}