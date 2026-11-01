export interface ServerToClientEvents {
  "room-joined": (data: { roomId: string; message: string }) => void;

  "room-left": (data: { roomId: string; message: string }) => void;

  "room-error": (data: { message: string }) => void;

  "playback-state": (state: PlaybackState) => void;
  "video-play": (state: PlaybackState) => void;
  "video-pause": (state: PlaybackState) => void;
  "video-seek": (state: PlaybackState) => void;
  "room-participants": (participants: RoomParticipant[]) => void;
}

export interface ClientToServerEvents {
  "join-room": (roomId: string) => void;
  "leave-room": (roomId: string) => void;

  "video-play": (data: PlaybackUpdate) => void;
  "video-pause": (data: PlaybackUpdate) => void;
  "video-seek": (data: PlaybackUpdate) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId: string;
}

export interface PlaybackState {
  currentTime: number;
  isPlaying: boolean;
  updatedAt: number;
}

export interface PlaybackUpdate {
  currentTime: number;
}

export interface RoomParticipant {
  userId: string;
  username: string;
  role: "HOST" | "MEMBER";
}
