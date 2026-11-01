import type { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import type { SocketData } from "./socket.types.js";

type AuthenticatedSocket = Socket<never, never, never, SocketData>;

export const authenticateSocket = (
  socket: AuthenticatedSocket,
  next: (error?: Error) => void,
) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token || typeof token !== "string") {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if (typeof decoded === "string" || typeof decoded.sub !== "string") {
      return next(new Error("Invalid authentication token"));
    }

    socket.data.userId = decoded.sub;

    next();
  } catch {
    next(new Error("Invalid or expired authentication token"));
  }
};
