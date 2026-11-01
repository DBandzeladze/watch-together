import { z } from "zod";

export const createRoomSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Room name must be at least 3 characters")
    .max(50, "Room name cannot exceed 50 characters"),

  videoUrl: z
    .string()
    .url("Please provide a valid video URL")
    .refine(
      (value) => value.startsWith("https://"),
      "Video URL must use HTTPS",
    ),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;

export const joinRoomSchema = z.object({
  inviteCode: z
    .string()
    .trim()
    .length(12, "Invitation code must be 12 characters")
    .toUpperCase(),
});

export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
