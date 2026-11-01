import type { Server, Socket } from "socket.io";

import { prisma } from "../lib/prisma.js";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  RoomParticipant,
} from "./socket.types.js";
import {
  getCurrentPlaybackState,
  getPlaybackState,
  updatePlaybackState,
} from "./playback.store.js";

type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

type AppServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
const isValidPlaybackUpdate = (
  data: unknown,
): data is { currentTime: number } => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const update = data as Record<string, unknown>;

  return (
    typeof update.currentTime === "number" &&
    Number.isFinite(update.currentTime) &&
    update.currentTime >= 0
  );
};
//just added
const broadcastRoomParticipants = async (
  io: AppServer,
  roomId: string,
  excludedSocketId?: string,
) => {
  const roomSockets = await io.in(roomId).fetchSockets();

  // Get unique user IDs, excluding a socket that is leaving.
  const userIds = [
    ...new Set(
      roomSockets
        .filter((roomSocket) => roomSocket.id !== excludedSocketId)
        .map((roomSocket) => roomSocket.data.userId),
    ),
  ];

  const memberships = await prisma.roomMember.findMany({
    where: {
      roomId,
      userId: { in: userIds },
    },
    select: {
      userId: true,
      role: true,
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  const participants: RoomParticipant[] = memberships.map((membership) => ({
    userId: membership.userId,
    username: membership.user.username,
    role: membership.role,
  }));

  io.to(roomId).emit("room-participants", participants);
};
//

export const registerSocketHandlers = (io: AppServer, socket: AppSocket) => {
  const handlePlaybackUpdate = (
    event: "video-play" | "video-pause" | "video-seek",
    data: unknown,
  ) => {
    const roomId = Array.from(socket.rooms).find((id) => id !== socket.id);

    if (!roomId) {
      socket.emit("room-error", {
        message: "You must join a room before controlling playback",
      });
      return;
    }

    if (!isValidPlaybackUpdate(data)) {
      socket.emit("room-error", {
        message: "Invalid playback position",
      });
      return;
    }

    const currentState = getPlaybackState(roomId);

    let isPlaying = currentState.isPlaying;

    if (event === "video-play") {
      isPlaying = true;
    } else if (event === "video-pause") {
      isPlaying = false;
    }

    const newState = updatePlaybackState(roomId, {
      currentTime: data.currentTime,
      isPlaying,
    });

    switch (event) {
      case "video-play":
        socket.to(roomId).emit("video-play", newState);
        break;

      case "video-pause":
        socket.to(roomId).emit("video-pause", newState);
        break;

      case "video-seek":
        socket.to(roomId).emit("video-seek", newState);
        break;
    }
  };

  socket.on("video-play", (data) => {
    handlePlaybackUpdate("video-play", data);
  });

  socket.on("video-pause", (data) => {
    handlePlaybackUpdate("video-pause", data);
  });

  socket.on("video-seek", (data) => {
    handlePlaybackUpdate("video-seek", data);
  });
  socket.on("join-room", async (roomId) => {
    try {
      if (!roomId) {
        socket.emit("room-error", {
          message: "Room ID is required",
        });
        return;
      }

      const membership = await prisma.roomMember.findUnique({
        where: {
          userId_roomId: {
            userId: socket.data.userId,
            roomId,
          },
        },
      });

      if (!membership) {
        socket.emit("room-error", {
          message: "You are not a member of this room",
        });
        return;
      }

      const existingRooms = Array.from(socket.rooms).filter(
        (id) => id !== socket.id,
      );

      for (const existingRoom of existingRooms) {
        await socket.leave(existingRoom);
        await broadcastRoomParticipants(io, existingRoom);
      }

      await socket.join(roomId);
      const playbackState = getCurrentPlaybackState(roomId);

      socket.emit("playback-state", playbackState);

      socket.emit("room-joined", {
        roomId,
        message: "Successfully joined room",
      });
      await broadcastRoomParticipants(io, roomId);

      console.log(`User ${socket.data.userId} joined room ${roomId}`);
    } catch (error) {
      console.error("Join room error:", error);

      socket.emit("room-error", {
        message: "Failed to join room",
      });
    }
  });

  socket.on("leave-room", async (roomId) => {
    if (!roomId) {
      socket.emit("room-error", {
        message: "Room ID is required",
      });
      return;
    }

    if (!socket.rooms.has(roomId)) {
      return;
    }

    await socket.leave(roomId);

    socket.emit("room-left", {
      roomId,
      message: "Successfully left room",
    });

    await broadcastRoomParticipants(io, roomId);
  });

  socket.on("disconnecting", async () => {
    const roomIds = Array.from(socket.rooms).filter(
      (roomId) => roomId !== socket.id,
    );

    for (const roomId of roomIds) {
      try {
        await broadcastRoomParticipants(io, roomId, socket.id);
      } catch (error) {
        console.error(
          `Failed to update participants for room ${roomId}:`,
          error,
        );
      }
    }
  });
};
