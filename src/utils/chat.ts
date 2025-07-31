import { batch, signal } from "@preact/signals";
import { connectionToTheHost$, isHost$, peer$ } from "./peer";
import { boardcastMessage, MessageType, sendMessage } from "./message";

export type ChatMessage = {
  senderId: string;
  content: string;
  timestamp: string;
};

export const chatMessageHistory$ = signal<ChatMessage[]>([]);
export const unreadChatMessages$ = signal(0);

export function insertChatMessageIntoHistory(message: ChatMessage) {
  batch(() => {
    chatMessageHistory$.value = chatMessageHistory$.value.concat(message);
    unreadChatMessages$.value++;
  });

  if (isHost$.value) {
    boardcastChatMessage(message);
    return;
  }
  if (message.senderId !== peer$.value.id) return;
  sendMessage(connectionToTheHost$.value, {
    type: MessageType.CHAT_MESSAGE,
    value: message,
  });
}

export function sendChatMessage(content: string) {
  const message: ChatMessage = {
    senderId: peer$.value.id,
    content,
    timestamp: new Date().toISOString(),
  };
  insertChatMessageIntoHistory(message);
}

export function boardcastChatMessage(chatMessage: ChatMessage) {
  boardcastMessage((c) =>
    c.peer === chatMessage.senderId
      ? null
      : {
          type: MessageType.CHAT_MESSAGE,
          value: chatMessage,
        }
  );
}
