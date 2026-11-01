import { io, type Socket } from "socket.io-client";

import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../src/types/socket";

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export const createSocketConnection = (token: string): AppSocket => {
  const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
    autoConnect: false,
    auth: {
      token,
    },
  });

  return socket as AppSocket;
};
