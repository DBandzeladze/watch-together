"use client";

import { useEffect, useState } from "react";

import { getAccessToken } from "../../lib/api";
import { createSocketConnection } from "../../lib/socket";

import type { Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  PlaybackState,
  RoomParticipant,
} from "../types/socket";

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseRoomSocketReturn {
  socket: AppSocket | null;
  isConnected: boolean;
  roomError: string | null;
  playbackState: PlaybackState | null;
  participants: RoomParticipant[];
}

export function useRoomSocket(
  roomId: string,
  enabled: boolean,
): UseRoomSocketReturn {
  const [socket, setSocket] = useState<AppSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(
    null,
  );
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      setRoomError("You must be logged in to join this room.");
      return;
    }

    const newSocket = createSocketConnection(token);

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      setRoomError(null);
      newSocket.emit("join-room", roomId);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("connect_error", () => {
      setRoomError("Could not connect to the server.");
    });

    newSocket.on("room-error", (data) => {
      setRoomError(data.message);
    });

    newSocket.on("room-participants", (updatedParticipants) => {
      setParticipants(updatedParticipants);
    });

    const handlePlaybackUpdate = (state: PlaybackState) => {
      setPlaybackState(state);
    };

    newSocket.on("playback-state", handlePlaybackUpdate);
    newSocket.on("video-play", handlePlaybackUpdate);
    newSocket.on("video-pause", handlePlaybackUpdate);
    newSocket.on("video-seek", handlePlaybackUpdate);

    newSocket.connect();

    return () => {
      newSocket.emit("leave-room", roomId);
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [roomId, enabled]);

  return {
    socket,
    isConnected,
    roomError,
    playbackState,
    participants,
  };
}
