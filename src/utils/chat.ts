import { batch, signal } from "@preact/signals";
import {
  connectionMap,
  connectionToTheHost,
  MessageType,
  isHost,
  peer,
  sendMessage,
} from "./peer";

export type ChatMessage = {
  senderId: string;
  content: string;
  timestamp: string;
};

export const chatMessageHistory = signal<ChatMessage[]>([]);
export const unreadChatMessages = signal(0);

export function insertChatMessageIntoHistory(message: ChatMessage) {
  batch(() => {
    chatMessageHistory.value = chatMessageHistory.value.concat(message);
    unreadChatMessages.value++;
  });

  if (isHost.value) {
    boardcastNewMessage(message);
    return;
  }
  if (message.senderId !== peer.value.id) return;
  sendMessage(connectionToTheHost.value, MessageType.CHAT_MESSAGE, message);
}

export function sendChatMessage(content: string) {
  const message: ChatMessage = {
    senderId: peer.value.id,
    content,
    timestamp: new Date().toISOString(),
  };
  insertChatMessageIntoHistory(message);
}

export function boardcastNewMessage(message: ChatMessage) {
  for (const [_, c] of connectionMap.value) {
    if (c.peer === message.senderId) continue;
    c.send({
      type: MessageType.CHAT_MESSAGE,
      value: message,
    });
  }
}
