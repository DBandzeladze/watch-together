export type RoomRole = "HOST" | "MEMBER";

export interface Room {
  id: string;
  name: string;
  inviteCode: string;
  videoUrl: string;
}

export interface UserRoom extends Room {
  createdAt: string;
  hostId: string;
  role: RoomRole;
  joinedAt: string;
}

export interface CreateRoomInput {
  name: string;
  videoUrl: string;
}

export interface JoinRoomInput {
  inviteCode: string;
}

export interface CreateRoomResponse {
  status: "success";
  message: string;
  data: {
    room: Room & {
      createdAt: string;
      hostId: string;
    };
  };
}

export interface JoinRoomResponse {
  status: "success";
  message: string;
  data: {
    room: Room & {
      role: RoomRole;
    };
  };
}

export interface UserRoomsResponse {
  status: "success";
  data: {
    rooms: UserRoom[];
  };
}

export interface LeaveRoomResponse {
  status: "success";
  message: string;
}
