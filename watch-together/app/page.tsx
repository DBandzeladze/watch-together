"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/src/context/AuthContext";
import {
  createRoom as createRoomService,
  getUserRooms,
  joinRoom as joinRoomService,
  leaveRoom as leaveRoomService,
} from "@/src/services/room.service";

import { UserRoom } from "@/src/types/room";

export default function Home() {
  const { user, isLoading, initializationError, signOut } = useAuth();
  const router = useRouter();

  const [rooms, setRooms] = useState<UserRoom[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [roomName, setRoomName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [leavingRoomId, setLeavingRoomId] = useState<string | null>(null);

  const loadRooms = async () => {
    setRoomsLoading(true);

    try {
      const userRooms = await getUserRooms();
      setRooms(userRooms);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load rooms");
    } finally {
      setRoomsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    let isMounted = true;

    const fetchRooms = async () => {
      try {
        const userRooms = await getUserRooms();

        if (isMounted) {
          setRooms(userRooms);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Could not load rooms");
        }
      } finally {
        if (isMounted) {
          setRoomsLoading(false);
        }
      }
    };

    fetchRooms();

    return () => {
      isMounted = false;
    };
  }, [user, isLoading, router]);

  const handleCreateRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsCreating(true);

    try {
      await createRoomService({ name: roomName, videoUrl });

      setRoomName("");
      setVideoUrl("");
      setSuccess("Room created successfully.");

      await loadRooms();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create room");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsJoining(true);

    try {
      await joinRoomService({ inviteCode: inviteCode.trim() });

      setInviteCode("");
      setSuccess("Successfully joined the room.");

      await loadRooms();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join room");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveRoom = async (roomId: string) => {
    setError("");
    setSuccess("");
    setLeavingRoomId(roomId);

    try {
      await leaveRoomService(roomId);
      setSuccess("You left the room.");
      await loadRooms();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not leave room");
    } finally {
      setLeavingRoomId(null);
    }
  };

  const handleLogout = () => {
    signOut();
    router.replace("/login");
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading...
      </main>
    );
  }

  if (initializationError && !user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 p-6 text-white">
        <p>{initializationError}</p>
        <Link href="/login" className="underline">
          Go to login
        </Link>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Watch Together</h1>
            <p className="text-sm text-zinc-400">Welcome, {user.username}</p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded border border-zinc-700 px-4 py-2 hover:bg-zinc-800"
          >
            Log out
          </button>
        </header>

        {error && (
          <p className="rounded bg-red-950 p-3 text-sm text-red-300">{error}</p>
        )}

        {success && (
          <p className="rounded bg-green-950 p-3 text-sm text-green-300">
            {success}
          </p>
        )}

        <section className="grid gap-6 md:grid-cols-2">
          <form
            onSubmit={handleCreateRoom}
            className="space-y-4 rounded-lg border border-zinc-800 p-5"
          >
            <h2 className="text-lg font-medium">Create a room</h2>

            <div>
              <label htmlFor="roomName" className="mb-1 block text-sm">
                Room name
              </label>
              <input
                id="roomName"
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                minLength={3}
                maxLength={50}
                required
                className="w-full rounded border border-zinc-700 bg-zinc-900 p-2"
                placeholder="Movie night"
              />
            </div>

            <div>
              <label htmlFor="videoUrl" className="mb-1 block text-sm">
                Video URL (HTTPS)
              </label>
              <input
                id="videoUrl"
                type="url"
                value={videoUrl}
                onChange={(event) => setVideoUrl(event.target.value)}
                required
                className="w-full rounded border border-zinc-700 bg-zinc-900 p-2"
                placeholder="https://..."
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full rounded bg-white px-4 py-2 font-medium text-black disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create room"}
            </button>
          </form>

          <form
            onSubmit={handleJoinRoom}
            className="space-y-4 rounded-lg border border-zinc-800 p-5"
          >
            <h2 className="text-lg font-medium">Join a room</h2>

            <div>
              <label htmlFor="inviteCode" className="mb-1 block text-sm">
                Invite code
              </label>
              <input
                id="inviteCode"
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value)}
                maxLength={12}
                required
                className="w-full rounded border border-zinc-700 bg-zinc-900 p-2"
                placeholder="Enter invite code"
              />
            </div>

            <button
              type="submit"
              disabled={isJoining}
              className="w-full rounded bg-white px-4 py-2 font-medium text-black disabled:opacity-50"
            >
              {isJoining ? "Joining..." : "Join room"}
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Your rooms</h2>

          {roomsLoading ? (
            <p className="text-zinc-400">Loading rooms...</p>
          ) : rooms.length === 0 ? (
            <p className="rounded-lg border border-zinc-800 p-5 text-zinc-400">
              You haven't joined any rooms yet. Create one or join a friend's
              room.
            </p>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-zinc-800 p-4"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/rooms/${room.id}`}
                      className="font-medium underline hover:text-zinc-300"
                    >
                      {room.name}
                    </Link>
                    <p className="text-sm text-zinc-400">
                      Invite code: {room.inviteCode}
                    </p>
                    <p className="text-xs text-zinc-500">Role: {room.role}</p>
                  </div>

                  {room.role === "MEMBER" && (
                    <button
                      onClick={() => handleLeaveRoom(room.id)}
                      disabled={leavingRoomId === room.id}
                      className="rounded border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
                    >
                      {leavingRoomId === room.id ? "Leaving..." : "Leave room"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
