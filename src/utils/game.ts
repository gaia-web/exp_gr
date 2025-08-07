import { computed, effect, signal } from "@preact/signals";
import { boardcastMessage, MessageType, sendMessage } from "./message";
import { connectionToTheHost$, isHost$, peer$ } from "./peer";

export enum GameStatus {
  READY = "ready",
  RETIRED = "retired",
}

export enum GameStateMessageType {
  _PLAYER_INFO = "_player_info",
  _HOST_PLAYER = "_host_player",
  _PLAYER_LIST = "_player_list",
}

type PlayerID = string;
type PlayerName = string;

export type GameInfo = {
  id: string;
  label: string;
  playerLimit: [number, number];
  description: string;
  pluginUrl: string;
};

export type GameListMessage = GameInfo[];

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

export const DEFAULT_GAME_LIST: GameInfo[] = [
  {
    id: "rps",
    label: "Rock, Paper, Scissors",
    description:
      "A quick and simple hand game for one or more players. Choose rock, paper, or scissors to compete against others or the computer.",
    playerLimit: [1, Infinity],
    pluginUrl: "/games/rock-paper-scissors/index.html",
  },
  {
    id: "ttt",
    label: "Tic-Tac-Toe",
    description:
      "A classic 2-player strategy game. Take turns placing Xs and Os on a 3×3 grid to get three in a row and win.",
    playerLimit: [2, 2],
    pluginUrl: "/games/tic-tac-toe/index.html",
  },
];

export const currentGamePluginIframe$ = signal<HTMLIFrameElement>(null);
export const currentGamePluginSrc$ = signal("");
export const currentGameList$ = signal<GameInfo[]>();
export const isGameActive$ = computed(() => !!currentGamePluginSrc$.value);
export const hasStartedGamePending$ = signal(false);

setTimeout(() => {
  effect(initializeCurrrentGameList);
  effect(handleCurrentGameListChange);
});

effect(handleCurrrentGamePluginChange);
effect(setAttentionStatus);

export function handleMessageFromTheGamePlugin(message: GameStateMessage) {
  switch (message.type) {
    default:
      console.info(`From plugin to host app:`, message);
      if (isHost$.value) {
        if (!message.to) {
          break;
        }
        if (message.to.includes(peer$.value.id)) {
          // TODO or just discard it
          sendMessageToTheGamePlugin({ ...message, to: void 0 });
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
        sendMessage(connectionToTheHost$.value, {
          type: MessageType.GAME_STATE,
          value: message,
        });
      }
      break;
  }
}

export function sendMessageToTheGamePlugin(message: GameStateMessage) {
  if (!currentGamePluginIframe$.value) throw "Game plugin is not available.";
  currentGamePluginIframe$.value.contentWindow.postMessage(message, "*");
}

export function boardcastGameStatus(message: GameStatusMessage) {
  boardcastMessage(() => ({ type: MessageType.GAME_STATUS, value: message }));
}

function initializeCurrrentGameList() {
  if (!peer$.value) return;
  if (!isHost$.value) return;
  const cachedGameList = JSON.parse(localStorage.getItem("game-list") ?? null);
  currentGameList$.value = cachedGameList ?? DEFAULT_GAME_LIST;
}

function handleCurrentGameListChange() {
  if (!isHost$.value) return;
  const list = currentGameList$.value;
  localStorage.setItem("game-list", JSON.stringify(list) ?? "null");
  console.info(`Broadcasting current game list:`, list);
  boardcastMessage(() => ({ type: MessageType.GAME_LIST, value: list }));
}

function handleCurrrentGamePluginChange() {
  if (!currentGamePluginIframe$.value) {
    return;
  }
  currentGamePluginIframe$.value.src = currentGamePluginSrc$.value;
}

function setAttentionStatus() {
  if (!isGameActive$.value) return;
  hasStartedGamePending$.value = true;
}
