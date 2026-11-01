import { apiRequest } from "@/lib/api";
import type {
  CreateRoomInput,
  CreateRoomResponse,
  JoinRoomInput,
  JoinRoomResponse,
  LeaveRoomResponse,
  UserRoom,
  UserRoomsResponse,
} from "../types/room";

export const getUserRooms = async (): Promise<UserRoom[]> => {
  const response = await apiRequest<UserRoomsResponse>(
    "/rooms",
    { method: "GET" },
    true,
  );

  return response.data.rooms;
};

export const createRoom = async (
  input: CreateRoomInput,
): Promise<CreateRoomResponse["data"]["room"]> => {
  const response = await apiRequest<CreateRoomResponse>(
    "/rooms",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    true,
  );

  return response.data.room;
};

export const joinRoom = async (
  input: JoinRoomInput,
): Promise<JoinRoomResponse["data"]["room"]> => {
  const response = await apiRequest<JoinRoomResponse>(
    "/rooms/join",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    true,
  );

  return response.data.room;
};

export const leaveRoom = async (roomId: string): Promise<void> => {
  await apiRequest<LeaveRoomResponse>(
    `/rooms/${encodeURIComponent(roomId)}/leave`,
    {
      method: "DELETE",
    },
    true,
  );
};
