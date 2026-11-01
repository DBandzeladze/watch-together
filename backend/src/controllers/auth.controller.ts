import type { Request, Response, NextFunction } from "express";
import { registerUser } from "../services/user.service.js";
import type { RegisterInput } from "../validators/auth.validator.js";
import { loginUser } from "../services/user.service.js";
import type { LoginInput } from "../validators/auth.validator.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await registerUser(req.body as RegisterInput);

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await loginUser(req.body as LoginInput);

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userId) {
      throw new AppError("Authentication required", 401);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.userId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
