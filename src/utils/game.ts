import { signal } from "@preact/signals";
import { boardcastMessage, Message, MessageType, sendMessage } from "./message";
import { connectionToTheHost, isHost, peer } from "./peer";

export enum GameStatus {
  READY = "ready",
  RETIRED = "retired",
}

export enum GameStateMessageType {
  _PLAYER_INFO = "_player_info",
  _PLAYER_LIST = "_player_list",
}

type PlayerID = string;
type PlayerName = string;

export type GameListMessage = {
  id: string;
  label: string;
  playerLimit: [number, number];
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
      type: GameStateMessageType._PLAYER_INFO;
      value: {
        id: PlayerID;
        name: PlayerName;
        isHost: boolean;
      };
    }
  | {
      type: GameStateMessageType._PLAYER_LIST;
      value: [PlayerID, PlayerName][];
    }
);

export const currentGamePluginIframe = signal<HTMLIFrameElement>(null);

export function handleMessageFromTheGamePlugin(message: GameStateMessage) {
  switch (message.type) {
    default:
      console.info(`From plugin to host app:`, message);
      if (isHost.value) {
        if (!message.to) {
          break;
        }
        if (message.to.includes(peer.value.id)) {
          // TODO or just discard it
          sendMessageToTheGamePlugin(message);
        }
        boardcastMessage((c) =>
          message.to.includes(c.peer)
            ? {
                type: MessageType.GAME_STATE,
                value: { ...message, to: void 0 },
              }
            : null
        );
      } else {
        sendMessage(connectionToTheHost.value, {
          type: MessageType.GAME_STATE,
          value: message,
        });
      }
      break;
  }
}

export function sendMessageToTheGamePlugin(message: GameStateMessage) {
  if (!currentGamePluginIframe.value) throw "Game plugin is not available.";
  currentGamePluginIframe.value.contentWindow.postMessage(message, "*");
}
