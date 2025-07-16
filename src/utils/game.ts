import { signal } from "@preact/signals";
import { Message } from "./message";

export enum GameStatus {
  READY = "ready",
  RETIRED = "retired",
}

export enum GameStateMessageType {
  PLAYER_INFO = "player_info",
  PLAYER_LIST = "player_list",
}

type PlayerID = string;
type PlayerName = string;

export type GameListMessage = {
  id: string;
  label: string;
  description: string;
  pluginUrl: string;
}[];

export type GameStatusMessage =
  | {
      type: GameStatus.READY;
      value: string;
    }
  | { type: GameStatus.RETIRED };

export type GameStateMessage = { to?: string } & (
  | {
      type: string;
      value: unknown;
    }
  | {
      type: GameStateMessageType.PLAYER_INFO;
      value: {
        id: PlayerID;
        name: PlayerName;
        isHost: boolean;
      };
    }
  | {
      type: GameStateMessageType.PLAYER_LIST;
      value: [PlayerID, PlayerName][];
    }
);

export function handleMessageFromTheGameIframe(message: GameStateMessage) {
  switch (message.type) {
    default:
      console.info(`From plugin to host:`, message);
      break;
  }
}
