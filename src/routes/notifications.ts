import { Router } from "express";
import { Types } from "mongoose";
import type { Server } from "socket.io";

import {
  Notification,
  NotificationType
} from "../models/Notification.js";

import {
  httpAuth,
  type AuthRequest
} from "../middleware/httpAuth.js";

export function createNotificationsRouter(io: Server) {
  const router = Router();

  // Все маршруты требуют JWT
  router.use(httpAuth);

  // POST /api/notifications
  // Создать новое уведомление
  router.post("/", async (req: AuthRequest, res) => {
    try {
      const { type, title, body } = req.body;

      if (
        !Object.values(NotificationType).includes(type) ||
        typeof title !== "string" ||
        !title.trim() ||
        typeof body !== "string" ||
        !body.trim()
      ) {
        res.status(400).json({
          message: "Invalid notification data"
        });
        return;
      }

      // Сохраняем уведомление в MongoDB
      const notification = await Notification.create({
        userId: req.userId,
        type,
        title: title.trim(),
        body: body.trim(),
        read: false
      });

      // Отправляем новое уведомление пользователю
      io.to(`user:${req.userId}`).emit(
        "notification:new",
        notification
      );

      // Считаем непрочитанные уведомления
      const unread = await Notification.countDocuments({
        userId: req.userId,
        read: false
      });

      // Обновляем счётчик в реальном времени
      io.to(`user:${req.userId}`).emit(
        "notification:count",
        { unread }
      );

      res.status(201).json(notification);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to create notification"
      });
    }
  });

  // GET /api/notifications
  // Получить историю уведомлений
  router.get("/", async (req: AuthRequest, res) => {
    try {
      const rawLimit = Number(req.query.limit ?? 20);

      if (!Number.isInteger(rawLimit) || rawLimit < 1) {
        res.status(400).json({
          message: "Invalid limit"
        });
        return;
      }

      const limit = Math.min(rawLimit, 100);
      const unreadOnly = req.query.unreadOnly === "true";

      const filter = {
        userId: req.userId,
        ...(unreadOnly ? { read: false } : {})
      };

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit);

      res.json(notifications);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to load notifications"
      });
    }
  });

  // PATCH /api/notifications/:id/read
  // Отметить уведомление прочитанным
  router.patch("/:id/read", async (req: AuthRequest, res) => {
    try {
      const id = req.params.id;

      if (
        typeof id !== "string" ||
        !Types.ObjectId.isValid(id)
      ) {
        res.status(400).json({
          message: "Invalid notification ID"
        });
        return;
      }

      // Обновляем только уведомление текущего пользователя
      const notification = await Notification.findOneAndUpdate(
        {
          _id: id,
          userId: req.userId
        },
        {
          $set: { read: true }
        },
        { new: true }
      );

      if (!notification) {
        res.status(404).json({
          message: "Notification not found"
        });
        return;
      }

      // Пересчитываем непрочитанные уведомления
      const unread = await Notification.countDocuments({
        userId: req.userId,
        read: false
      });

      // Отправляем обновлённый счётчик через Socket.IO
      io.to(`user:${req.userId}`).emit(
        "notification:count",
        { unread }
      );

      res.json({ success: true });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to update notification"
      });
    }
  });

  return router;
}