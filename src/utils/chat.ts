import { computed, effect, signal } from "@preact/signals";
import { DataConnection } from "peerjs";
import { connectionMap, DataType } from "./peer";

export type Message = {
  sender: string;
  chatroom: string;
  content: string;
  timestamp: Date;
};

export const chatHistory = signal<Map<string, Message[]>>(new Map());

// I think we should make this sendChatMessage to expect a pass in variable of DataConnection.
export function sendChatMessage(roonName: string, message: Message) {
  // const newMessage = {
  //   sender: "somesender",
  //   chatroom: "chatroomName",
  //   content,
  //   timestamp: new Date(),
  // } as Message;
  console.log(chatHistory);

  chatHistory.value.get(roonName).push(message);

  // Here we traversal all connection to boardcast message
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
