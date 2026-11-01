import "dotenv/config";
import { createServer } from "node:http";
import { Server } from "socket.io";
import app from "./app.js";
import { prisma } from "./lib/prisma.js";
import { authenticateSocket } from "./socket/socket.middleware.js";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "./socket/socket.types.js";
import { registerSocketHandlers } from "./socket/socket.handlers.js";

const PORT = process.env.PORT || 5001;

const httpServer = createServer(app);

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.use(authenticateSocket);

io.on("connection", (socket) => {
  console.log(`Authenticated socket connected: ${socket.id}`);
  console.log(`User ID: ${socket.data.userId}`);

  registerSocketHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const shutdown = async () => {
  console.log("Shutting down server...");

  io.close(() => {
    httpServer.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
