import { DataConnection } from "peerjs";
import { ChatMessage, insertChatMessageIntoHistory } from "./chat";
import { connectionMap, isHost } from "./peer";
import { exitRoom, playerMap } from "./session";
import { GameListMessage, GameStatus, GameStatusMessage } from "./game";

export enum MessageType {
  PLAYER_NAME = "player_name",
  UNAVAILABLE_PLAYER_NAME = "unavailable_player_name",
  PLAYER_LIST = "player_list",
  CHAT_MESSAGE = "chat_message",
  GAME_LIST = "game_list",
  GAME_STATUS = "game_status",
  GAME_STATE = "game_state",
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
};

// TODO instead of letting client disconnect from Host, we should let host disconnect client
function disconnectFromHost(connection: DataConnection) {
  if (isHost.value) return;

  connection.close();
  exitRoom();
}

function validateNewPlayerName(name: string): boolean {
  let isNameAvailable = true;
  for (const key of playerMap.value.keys()) {
    const value = playerMap.value.get(key);
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
  if (!isHost.value) return;

  if (!validateNewPlayerName(message.value)) {
    sendMessage(connection, {
      type: MessageType.UNAVAILABLE_PLAYER_NAME,
      value: message.value,
    });

    return;
  }

  playerMap.value = new Map([
    ...playerMap.value,
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
  playerMap.value = new Map(message.value as [string, string][]);
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
  if (isHost.value) return;
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
  if (isHost.value) return;
  // TODO update UI's game list based on the host-sent message
}

function handleGameStateMessage(message: Message<GameStatusMessage>) {
  if (message.type !== MessageType.GAME_STATE) throw "Wrong message type";
  if (message.value?.type == null) return;
  // TODO pass the message to the game plugin
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
  if (!isHost.value) {
    console.error("Non-host cannot boardcast message.");
    return;
  }
  for (const [_, c] of connectionMap.value) {
    const message = callback(c);
    if (message == null) continue;
    sendMessage(c, message);
  }
}
