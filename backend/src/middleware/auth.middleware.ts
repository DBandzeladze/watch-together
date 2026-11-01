import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("Invalid authentication token", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if (typeof decoded === "string" || typeof decoded.sub !== "string") {
      throw new AppError("Invalid authentication token", 401);
    }

    req.userId = decoded.sub;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      next(new AppError("Invalid or expired token", 401));
      return;
    }

    next(error);
  }
};
