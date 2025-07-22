import { connectionToTheHost, isHost, peer } from "./peer";
import { boardcastMessage, MessageType, sendMessage } from "./message";
import {
  boardcastPlayerList,
  playerMap,
  playerName,
  PlayerState,
} from "./session";
import { signal } from "@preact/signals";

export type GamePickStateMessage = {
  name: string;
  gamePickedIndex: number;
};

export const gamePick = signal<number>(-1);
export const gamePickMap = signal<Map<string, number>>(new Map());

export function gamePickInit(gameIndex: number) {
  const message: PlayerState = {
    name: playerName.value,
    gamePickedIndex: gameIndex,
  };

  gamePickMap.value.set(playerName.value, gamePick.value);

  // TODO change this
  sendMessage(connectionToTheHost.value, {
    type: MessageType.GAME_PICK_STATE,
    value: message,
  });

  if (isHost.value) {
    broadCastGamePick();
  }
}

function broadCastGamePick() {
  if (!isHost.value) return;
  // broadcast messages
  const gamePickStatePair = [...playerMap.value];
  boardcastMessage(() => ({
    type: MessageType.GAME_PICK_STATE,
    value: gamePickStatePair,
  }));
}

export function sendGamePickMessage(gameIndex: number) {
  const message: PlayerState = {
    name: playerName.value,
    gamePickedIndex: gameIndex,
  };

  playerMap.value.get(peer.value.id).gamePickedIndex = gameIndex;

  sendMessage(connectionToTheHost.value, {
    type: MessageType.GAME_PICK,
    value: message,
  });

  if (isHost.value) {
    boardcastPlayerList();
    playerMap.value = new Map(playerMap.value);
  }
}
