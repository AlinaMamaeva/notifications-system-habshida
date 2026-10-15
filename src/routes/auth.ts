import { Router } from "express";
import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { username } = req.body;

    if (typeof username !== "string" || !username.trim()) {
      res.status(400).json({
        message: "Username is required"
      });
      return;
    }

    const normalizedUsername = username.trim();

    let user = await User.findOne({
      username: normalizedUsername
    });

    if (!user) {
      user = await User.create({
        username: normalizedUsername
      });
    }

    const token = signToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Login failed"
    });
  }
});

export default router;