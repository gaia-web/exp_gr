import { computed, effect, signal } from "@preact/signals";
import { DataConnection } from "peerjs";
import { connectionMap, DataType } from "./peer";

export type Message = {
  sender: string;
  chatroom: string;
  content: string;
  timestamp: Date;
};

export const chatHistory = signal<Message[]>();

// This is very inefficient...
export function insertChatMessageIntoHistory(message: Message) {
  const history = chatHistory.value;
  history.push(message);
  chatHistory.value = [...history];

  console.log("inserting chat message to history need to reboardcast?", connectionMap)
}

export function sendChatMessage(roonName: string, message: Message) {
  insertChatMessageIntoHistory(message);

  // Here we traversal all connection to boardcast message, also, very inefficient
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
