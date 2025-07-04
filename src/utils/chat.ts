import { signal } from "@preact/signals";
import { connectionMap, DataType } from "./peer";

export type Message = {
  sender: string;
  chatroom: string;
  content: string;
  timestamp: Date;
};

export const chatHistory = signal<Message[]>();

export function insertChatMessageIntoHistory(message: Message) {
  const history = chatHistory.value;
  history.push(message);
  chatHistory.value = [...history];
}

export function sendChatMessage(roonName: string, message: Message) {
  insertChatMessageIntoHistory(message);

  const connectionAndPlayerNamePairs = [...connectionMap.value.entries()];
  for (const [c] of connectionAndPlayerNamePairs) {
    c.send({
      type: DataType.SEND_MESSAGE,
      value: [
        {
          message,
        },
        ...connectionAndPlayerNamePairs.map(([p, n]) => ({
          id: p.peer,
          playerName: n,
        })),
      ],
    });
  }
}
