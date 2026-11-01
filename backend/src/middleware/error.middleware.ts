import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    status: "error",
    message:
      error instanceof AppError ? error.message : "Internal server error",
  });
};
