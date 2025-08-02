import { connectionToTheHost$, isHost$ } from "./peer";
import { boardcastMessage, MessageType, sendMessage } from "./message";
import { playerName$ } from "./session";
import { signal } from "@preact/signals";

export type GamePickStateMessage = {
  name: string;
  gamePickedId: string | null;
};

export const gamePick$ = signal<string>(null);
export const gamePickMap$ = signal<Map<string, string>>(new Map());

export function sendGamePick(gameId: string | null) {
  gamePick$.value = gameId;
  if (gameId == null) {
    gamePickMap$.value.set(playerName$.value, gameId);
    gamePickMap$.value = new Map([...gamePickMap$.value]);
  } else {
    gamePickMap$.value = new Map([
      ...gamePickMap$.value,
      [playerName$.value, gameId],
    ]);
  }

  if (isHost$.value) {
    broadCastGamePick();
  } else {
    const message: GamePickStateMessage = {
      name: playerName$.value,
      gamePickedId: gameId,
    };
    sendMessage(connectionToTheHost$.value, {
      type: MessageType.GAME_PICK_STATE,
      value: message,
    });
  }
}

export function broadCastGamePick() {
  if (!isHost$.value) return;
  // broadcast messages
  const gamePickStatePair = [...gamePickMap$.value];
  boardcastMessage(() => ({
    type: MessageType.GAME_PICK_STATE_BROADCAST,
    value: gamePickStatePair,
  }));
}

