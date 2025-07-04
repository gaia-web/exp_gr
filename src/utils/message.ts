import { DataConnection } from "peerjs";
import { ChatMessage, insertChatMessageIntoHistory } from "./chat";
import { boardcastPlayerList, connectionMap, isHost } from "./peer";
import { playerMap } from "./session";

export enum MessageType {
  UPDATE_PLAYER_NAME = "update_player_name",
  UPDATE_PLAYER_LIST = "update_player_list",
  CHAT_MESSAGE = "chat_message",
}

export type Message<T = unknown> = {
  type: MessageType;
  value: T;
};

export const messageHandler = (
  data: { type?: string; value?: unknown },
  connection: DataConnection
) => {
  switch (data.type) {
    case MessageType.UPDATE_PLAYER_NAME:
      if (!data) break;
      if (!isHost.value) break;
      playerMap.value = new Map([
        ...playerMap.value,
        [connection.peer, data.value.toString()],
      ]);
      console.info(`Peer ${connection.peer} updated its name as ${data.value}`);
      boardcastPlayerList();
      break;
    case MessageType.UPDATE_PLAYER_LIST:
      console.info(`Player list updated as: `, data.value);
      playerMap.value = new Map(data.value as [string, string][]);
      break;
    case MessageType.CHAT_MESSAGE: {
      const message = data.value as ChatMessage;
      console.info(
        `Player ${message.senderId} sent a message at ${message.timestamp} with content:`,
        message.content
      );
      insertChatMessageIntoHistory(message);
      break;
    }
  }
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
