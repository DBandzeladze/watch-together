"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/src/context/AuthContext";
import { getUserRooms } from "@/src/services/room.service";
import type { UserRoom } from "@/src/types/room";
import { useRoomSocket } from "@/src/hooks/useRoomSocket";
import { PlaybackState } from "@/src/types/socket";

interface RoomPageContentProps {
  params: Promise<{ roomId: string }>;
}

export default function RoomPageContent({ params }: RoomPageContentProps) {
  const { roomId } = use(params);
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { socket, isConnected, roomError, playbackState, participants } =
    useRoomSocket(roomId);

  const [room, setRoom] = useState<UserRoom | null>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [error, setError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);

  const expectedRemoteEvents = useRef({
    play: false,
    pause: false,
    seekTo: null as number | null,
  });

  const pendingPlaybackState = useRef<PlaybackState | null>(null);

  const handlePlay = () => {
    if (expectedRemoteEvents.current.play) {
      expectedRemoteEvents.current.play = false;
      return;
    }

    if (!socket || !isConnected) return;

    const video = videoRef.current;
    if (!video) return;

    socket.emit("video-play", {
      currentTime: video.currentTime,
    });
  };

  const handlePause = () => {
    if (expectedRemoteEvents.current.pause) {
      expectedRemoteEvents.current.pause = false;
      return;
    }

    if (!socket || !isConnected) return;

    const video = videoRef.current;
    if (!video) return;

    socket.emit("video-pause", {
      currentTime: video.currentTime,
    });
  };

  const handleSeeked = () => {
    const video = videoRef.current;
    if (!video) return;

    const expectedTime = expectedRemoteEvents.current.seekTo;

    if (
      expectedTime !== null &&
      Math.abs(video.currentTime - expectedTime) < 0.5
    ) {
      expectedRemoteEvents.current.seekTo = null;
      return;
    }

    if (!socket || !isConnected) return;

    socket.emit("video-seek", {
      currentTime: video.currentTime,
    });
  };

  const applyRemotePlayback = async (state: PlaybackState) => {
    const video = videoRef.current;

    if (!video || video.readyState < 1) {
      pendingPlaybackState.current = state;
      return;
    }

    pendingPlaybackState.current = null;

    if (Math.abs(video.currentTime - state.currentTime) > 0.25) {
      expectedRemoteEvents.current.seekTo = state.currentTime;
      video.currentTime = state.currentTime;
    }

    if (state.isPlaying && video.paused) {
      expectedRemoteEvents.current.play = true;

      try {
        await video.play();
      } catch (error) {
        expectedRemoteEvents.current.play = false;
        console.warn("Remote playback requires user interaction:", error);
      }
    } else if (!state.isPlaying && !video.paused) {
      expectedRemoteEvents.current.pause = true;
      video.pause();
    }
  };

  const handleLoadedMetadata = () => {
    const pendingState = pendingPlaybackState.current;

    if (pendingState) {
      void applyRemotePlayback(pendingState);
    }
  };

  useEffect(() => {
    if (!playbackState) return;

    void applyRemotePlayback(playbackState);
  }, [playbackState]);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    let isMounted = true;

    const fetchRoom = async () => {
      try {
        const rooms = await getUserRooms();
        const foundRoom = rooms.find((item) => item.id === roomId);

        if (isMounted) {
          if (foundRoom) {
            setRoom(foundRoom);
          } else {
            setError("Room not found or you are not a member of this room.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Could not load room");
        }
      } finally {
        if (isMounted) setIsLoadingRoom(false);
      }
    };

    fetchRoom();

    return () => {
      isMounted = false;
    };
  }, [user, isLoading, roomId, router]);

  if (isLoading || isLoadingRoom) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-5xl space-y-6 p-6">Loading room...</div>
      </main>
    );
  }

  if (!user) return null;

  if (error || !room) {
    return (
      <main className="p-8">
        <p>{error || "Room not found"}</p>
        <Link href="/" className="underline">
          Back to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-yellow-500"
              }`}
            />

            <span className="text-zinc-400">
              {isConnected ? "Connected" : "Connecting..."}
            </span>
          </div>

          {roomError && <p className="text-sm text-red-400">{roomError}</p>}
          <div>
            <h1 className="text-2xl font-semibold">{room.name}</h1>
            <p className="text-sm text-zinc-400">
              Invite code: {room.inviteCode}
            </p>
          </div>

          <Link href="/" className="underline">
            Back to dashboard
          </Link>
        </header>

        <video
          ref={videoRef}
          controls
          playsInline
          preload="metadata"
          src={room.videoUrl}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeeked={handleSeeked}
          onLoadedMetadata={handleLoadedMetadata}
        >
          Your browser does not support video playback.
        </video>
        <section className="mt-6 rounded-lg border border-gray-700 bg-gray-900 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Participants</h2>

            <span className="text-sm text-gray-400">
              {participants.length} online
            </span>
          </div>

          {participants.length === 0 ? (
            <p className="text-sm text-gray-400">No participants online.</p>
          ) : (
            <ul className="space-y-3">
              {participants.map((participant) => (
                <li
                  key={participant.userId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 font-medium text-white">
                      {participant.username.charAt(0).toUpperCase()}
                    </div>

                    <span className="text-sm text-white">
                      {participant.username}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {participant.role === "HOST" && (
                      <span className="text-xs text-gray-400">Host</span>
                    )}

                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-xs text-green-400">Online</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="text-sm text-zinc-400">Room role: {room.role}</p>
      </div>
    </main>
  );
}
