import { randomBytes } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import type { CreateRoomInput } from "../validators/room.validator.js";
import { AppError } from "../utils/AppError.js";
import type { JoinRoomInput } from "../validators/room.validator.js";

export const createRoom = async (data: CreateRoomInput, userId: string) => {
  const inviteCode = randomBytes(6).toString("hex").toUpperCase();

  const room = await prisma.room.create({
    data: {
      name: data.name,
      videoUrl: data.videoUrl,
      inviteCode,
      host: {
        connect: {
          id: userId,
        },
      },
      members: {
        create: {
          user: {
            connect: {
              id: userId,
            },
          },
          role: "HOST",
        },
      },
    },
    select: {
      id: true,
      name: true,
      inviteCode: true,
      videoUrl: true,
      createdAt: true,
      hostId: true,
    },
  });

  return room;
};

export const joinRoom = async (data: JoinRoomInput, userId: string) => {
  const room = await prisma.room.findUnique({
    where: {
      inviteCode: data.inviteCode,
    },
  });

  if (!room) {
    throw new AppError("Room not found", 404);
  }

  const existingMembership = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId,
        roomId: room.id,
      },
    },
  });

  if (existingMembership) {
    throw new AppError("You are already a member of this room", 409);
  }

  const membership = await prisma.roomMember.create({
    data: {
      userId,
      roomId: room.id,
      role: "MEMBER",
    },
  });

  return {
    id: room.id,
    name: room.name,
    inviteCode: room.inviteCode,
    videoUrl: room.videoUrl,
    role: membership.role,
  };
};

export const leaveRoom = async (roomId: string, userId: string) => {
  const membership = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId,
        roomId,
      },
    },
  });

  if (!membership) {
    throw new AppError("You are not a member of this room", 404);
  }

  if (membership.role === "HOST") {
    throw new AppError(
      "The host cannot leave the room. Delete the room or transfer ownership instead.",
      403,
    );
  }

  await prisma.roomMember.delete({
    where: {
      userId_roomId: {
        userId,
        roomId,
      },
    },
  });
};

export const getUserRooms = async (userId: string) => {
  const memberships = await prisma.roomMember.findMany({
    where: {
      userId,
    },
    include: {
      room: {
        select: {
          id: true,
          name: true,
          inviteCode: true,
          videoUrl: true,
          createdAt: true,
          hostId: true,
        },
      },
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  return memberships.map((membership) => ({
    ...membership.room,
    role: membership.role,
    joinedAt: membership.joinedAt,
  }));
};
