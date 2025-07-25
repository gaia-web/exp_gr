import { connectionToTheHost, isHost } from "./peer";
import { boardcastMessage, MessageType, sendMessage } from "./message";
import { playerName } from "./session";
import { signal } from "@preact/signals";

export type GamePickStateMessage = {
  name: string;
  gamePickedIndex: number;
};

export const gamePick = signal<number>(-1);
export const gamePickMap = signal<Map<string, number>>(new Map());

export function sendGamePick(gameIndex: number) {
  gamePick.value = gameIndex;
  if (gameIndex === -1) {
    gamePickMap.value.set(playerName.value, gameIndex);
    gamePickMap.value = new Map([...gamePickMap.value]);
  } else {
    gamePickMap.value = new Map([
      ...gamePickMap.value,
      [playerName.value, gameIndex],
    ]);
  }

  if (isHost.value) {
    broadCastGamePick();
  } else {
    const message: GamePickStateMessage = {
      name: playerName.value,
      gamePickedIndex: gameIndex,
    };
    sendMessage(connectionToTheHost.value, {
      type: MessageType.GAME_PICK_STATE,
      value: message,
    });
  }
}

export function broadCastGamePick() {
  if (!isHost.value) return;
  // broadcast messages
  const gamePickStatePair = [...gamePickMap.value];
  boardcastMessage(() => ({
    type: MessageType.GAME_PICK_STATE_BROADCAST,
    value: gamePickStatePair,
  }));
}
