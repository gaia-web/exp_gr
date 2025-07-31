import { DataConnection } from "peerjs";
import { ChatMessage, insertChatMessageIntoHistory } from "./chat";
import { connectionMap$, isHost$ } from "./peer";
import { exitRoom, playerMap$ } from "./session";
import {
  currentGamePluginIframe$,
  GameListMessage,
  GameStateMessage,
  GameStatus,
  GameStatusMessage,
  sendMessageToTheGamePlugin,
} from "./game";
import { broadCastGamePick, gamePickMap$, GamePickStateMessage } from "./game-pick";

export enum MessageType {
  /**
   * Update player's name to the host.
   * __It should only be sent from a non-host peer.__
   */
  PLAYER_NAME = "player_name",
  /**
   * Notify the player's name is unavailable.
   * __It should only be sent from the host peer.__
   */
  UNAVAILABLE_PLAYER_NAME = "unavailable_player_name",
  /**
   * Update the player list, including player IDs and names.
   * __It should only be sent from the host peer.__
   */
  PLAYER_LIST = "player_list",
  /**
   * Send a chat message.
   */
  CHAT_MESSAGE = "chat_message",
  /**
   * Update the game list.
   * __It should only be sent from the host peer.__
   */
  GAME_LIST = "game_list",
  /**
   * Update the game lifecycle status, such as `ready` and `retired`.
   * __It should only be sent from the host peer.__
   */
  GAME_STATUS = "game_status",
  /**
   * Notify a change of game internal state, which should be forwarded to the game plugin.
   */
  GAME_STATE = "game_state",
  /**
   * Notify a change of game pick state 
   */
  GAME_PICK_STATE = "game_pick_state",
  /**
   * Broadcast game pick state from host to all clients
   */
  GAME_PICK_STATE_BROADCAST = "game_pick_state_broadcast",
}

export type Message<T = unknown> = {
  type?: MessageType;
  value?: T;
};

export const messageHandlerDict: Record<
  string,
  (message: Message, connection: DataConnection) => void
> = {
  [MessageType.PLAYER_NAME]: handlePlayerNameMessage,
  [MessageType.UNAVAILABLE_PLAYER_NAME]: handleUnavailablePlayerNameMessage,
  [MessageType.PLAYER_LIST]: handlePlayerListMessage,
  [MessageType.CHAT_MESSAGE]: handleChatMessage,
  [MessageType.GAME_LIST]: handleGameListMessage,
  [MessageType.GAME_STATUS]: handleGameStatusMessage,
  [MessageType.GAME_STATE]: handleGameStateMessage,
  [MessageType.GAME_PICK_STATE]: handleGamePickStateMessage,
  [MessageType.GAME_PICK_STATE_BROADCAST]: handleGamePickStateBrocastMessage,
};

// TODO instead of letting client disconnect from Host, we should let host disconnect client
function disconnectFromHost(connection: DataConnection) {
  if (isHost$.value) return;

  connection.close();
  exitRoom();
}

function validateNewPlayerName(name: string): boolean {
  let isNameAvailable = true;
  for (const key of playerMap$.value.keys()) {
    const value = playerMap$.value.get(key);
    if (name === value) {
      isNameAvailable = false;
      break;
    }
  }

  return isNameAvailable;
}

function handlePlayerNameMessage(
  message: Message<string>,
  connection: DataConnection
) {
  if (!message) return;
  if (!isHost$.value) return;

  if (!validateNewPlayerName(message.value)) {
    sendMessage(connection, {
      type: MessageType.UNAVAILABLE_PLAYER_NAME,
      value: message.value,
    });

    return;
  }

  playerMap$.value = new Map([
    ...playerMap$.value,
    [connection.peer, message.value.toString()],
  ]);
  console.info(`Peer ${connection.peer} updated its name as ${message.value}`);
}

function handleUnavailablePlayerNameMessage(
  message: Message,
  connection: DataConnection
) {
  alert(
    `Name ${message.value} already been taken! Please choose a different name`
  );

  disconnectFromHost(connection);
}

function handlePlayerListMessage(message: Message) {
  console.info(`Player list updated as: `, message.value);
  playerMap$.value = new Map(message.value as [string, string][]);
}

function handleChatMessage(message: Message<ChatMessage>) {
  const chatMessage = message.value;
  console.info(
    `Player ${chatMessage.senderId} sent a message at ${chatMessage.timestamp} with content:`,
    chatMessage.content
  );
  insertChatMessageIntoHistory(chatMessage);
}

function handleGameStatusMessage(message: Message<GameStatusMessage>) {
  if (message.type !== MessageType.GAME_STATUS) throw "Wrong message type";
  if (isHost$.value) return;
  switch (message.value?.type) {
    case GameStatus.READY:
      // TODO loads the game and maybe also navigate to the playing page
      console.info(`The host started a game with id ${message.value.value}.`);
      break;
    case GameStatus.RETIRED:
      // TODO unloads the game and maybe also navigate out from the playing page
      console.info(`The host ended the current game.`);
      break;
  }
}

function handleGameListMessage(message: Message<GameListMessage>) {
  if (isHost$.value) return;
  // TODO update UI's game list based on the host-sent message
}

function handleGameStateMessage(message: Message<GameStateMessage>) {
  if (message.type !== MessageType.GAME_STATE) throw "Wrong message type";
  if (message.value?.type == null) return;
  if (!currentGamePluginIframe$.value) throw "Game plugin is not available.";
  sendMessageToTheGamePlugin(message.value);
}

function handleGamePickStateMessage(message: Message<GamePickStateMessage>) {
  gamePickMap$.value = new Map([
    ...gamePickMap$.value,
    [message.value.name, message.value.gamePickedIndex],
  ]);

  if(isHost$.value) {
    broadCastGamePick();
  }
}

function handleGamePickStateBrocastMessage(message:Message<[string, number][]>) {
  gamePickMap$.value = new Map([
    ...message.value,
  ]);
}

export const handleMessage = (message: Message, connection: DataConnection) => {
  const handler = messageHandlerDict[message.type];
  if (!handler) {
    console.error("No message handler found for", message);
    return;
  }
  // TODO maybe only the inner message is needed to be passed to the handler
  handler(message, connection);
};

export function sendMessage(connection: DataConnection, message: Message) {
  if (!connection) {
    console.error("No connection instance");
    return;
  }
  connection.send(message);
}

export function boardcastMessage(
  callback: (c: DataConnection) => Message | null
) {
  if (!isHost$.value) {
    console.error("Non-host cannot boardcast message.");
    return;
  }
  for (const [_, c] of connectionMap$.value) {
    const message = callback(c);
    if (message == null) continue;
    sendMessage(c, message);
  }
}
