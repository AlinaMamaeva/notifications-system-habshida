import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  userId?: string;
}

export function httpAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Unauthorized: Token missing"
    });
    return;
  }

  const token = authorization.slice(7);

  try {
    const userId = verifyToken(token);

    req.userId = userId;

    next();
  } catch {
    res.status(401).json({
      message: "Unauthorized: Invalid token"
    });
  }
}