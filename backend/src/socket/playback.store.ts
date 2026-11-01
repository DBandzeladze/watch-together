import type { PlaybackState } from "./socket.types.js";

const playbackStates = new Map<string, PlaybackState>();

export const getPlaybackState = (roomId: string): PlaybackState => {
  let state = playbackStates.get(roomId);

  if (!state) {
    state = {
      currentTime: 0,
      isPlaying: false,
      updatedAt: Date.now(),
    };

    playbackStates.set(roomId, state);
  }

  return state;
};

export const updatePlaybackState = (
  roomId: string,
  update: Partial<PlaybackState>,
): PlaybackState => {
  const currentState = getPlaybackState(roomId);

  const newState: PlaybackState = {
    ...currentState,
    ...update,
    updatedAt: Date.now(),
  };

  playbackStates.set(roomId, newState);

  return newState;
};

export const getCurrentPlaybackState = (roomId: string): PlaybackState => {
  const state = getPlaybackState(roomId);

  if (!state.isPlaying) {
    return state;
  }

  const elapsedSeconds = (Date.now() - state.updatedAt) / 1000;

  return {
    ...state,
    currentTime: state.currentTime + elapsedSeconds,
  };
};
