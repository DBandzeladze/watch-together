import type { Request, Response, NextFunction } from "express";
import { createRoom } from "../services/room.service.js";
import { AppError } from "../utils/AppError.js";
import type { CreateRoomInput } from "../validators/room.validator.js";
import { joinRoom, leaveRoom, getUserRooms } from "../services/room.service.js";

import { joinRoomSchema } from "../validators/room.validator.js";

import { z } from "zod";

export const createRoomController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userId) {
      throw new AppError("Authentication required", 401);
    }

    const room = await createRoom(req.body as CreateRoomInput, req.userId);

    res.status(201).json({
      status: "success",
      message: "Room created successfully",
      data: {
        room,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const joinRoomController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userId) {
      throw new AppError("Authentication required", 401);
    }

    const room = await joinRoom(
      req.body as z.infer<typeof joinRoomSchema>,
      req.userId,
    );

    res.status(200).json({
      status: "success",
      message: "Joined room successfully",
      data: { room },
    });
  } catch (error) {
    next(error);
  }
};

export const leaveRoomController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userId) {
      throw new AppError("Authentication required", 401);
    }

    const roomIdResult = z.string().uuid().safeParse(req.params.roomId);

    if (!roomIdResult.success) {
      throw new AppError("Invalid room ID", 400);
    }

    await leaveRoom(roomIdResult.data, req.userId);

    res.status(200).json({
      status: "success",
      message: "Left room successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getUserRoomsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.userId) {
      throw new AppError("Authentication required", 401);
    }

    const rooms = await getUserRooms(req.userId);

    res.status(200).json({
      status: "success",
      data: { rooms },
    });
  } catch (error) {
    next(error);
  }
};
