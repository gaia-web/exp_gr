import { batch, signal } from "@preact/signals";
import { connectionMap, connectionToTheHost, isHost, peer } from "./peer";
import { boardcastChatMessage } from "./chat";
import { boardcastMessage, MessageType, sendMessage } from "./message";

export type GamePickMessage = {
  senderId: string;
  gameIndex: number;
};

export const gamePickState = signal<Map<string, number>>(new Map());
export const gameReady = signal<boolean>(false);

export function insertGamePickMessageIntoState(message: GamePickMessage) {
  batch(() => {
    gamePickState.value = new Map(gamePickState.value.set(message.senderId, message.gameIndex));
    gameReady.value = gamePickState.value.size === connectionMap.value.size;

    if (isHost.value) {
        boardcastGamePickMessage(message);
    }
    if (message.senderId !== peer.value.id) return;
      sendMessage(connectionToTheHost.value, {
        type: MessageType.GAME_READY,
        value: message,
      });
  });
}

export function sendGamePickMessage(gameIndex: number) {
  const message: GamePickMessage = {
    senderId: peer.value.id,
    gameIndex,
  };
  insertGamePickMessageIntoState(message);
}

export function boardcastGamePickMessage(message: GamePickMessage) {
  boardcastMessage((c) =>
    c.peer === message.senderId
      ? null
      : {
          type: MessageType.GAME_READY,
          value: message,
        }
  );
}
