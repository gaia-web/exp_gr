import { connectionToTheHost$, isHost$ } from "./peer";
import { boardcastMessage, MessageType, sendMessage } from "./message";
import { playerName$ } from "./session";
import { effect, signal } from "@preact/signals";

export type GamePickStateMessage = {
  name: string;
  gamePickedId: string | null;
};

export const gamePick$ = signal<string>(null);
export const gamePickMap$ = signal<Map<string, string>>(new Map());
export const hasGamePickPending$ = signal(false);

effect(setAttentionStatus);

export function sendGamePickMessage(gameId: string | null) {
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
    broadCastGamePickMessage();
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

export function broadCastGamePickMessage() {
  if (!isHost$.value) return;
  const gamePickStatePair = [...gamePickMap$.value];
  boardcastMessage(() => ({
    type: MessageType.GAME_PICK_STATE_BROADCAST,
    value: gamePickStatePair,
  }));
}

function setAttentionStatus() {
  gamePickMap$.value;
  hasGamePickPending$.value = true;
}
