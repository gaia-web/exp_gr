import {
  connectionMap,
  peer,
  PEER_ID_PREFIX,
  PEER_JS_OPTIONS,
  playerCount,
  playerList,
  playerName,
  roomName,
} from "../../utils/peer";

import { Message, chatHistory, sendChatMessage } from "../../utils/chat";
import { JSX } from "preact";
import { useSignal } from "@preact/signals";
import Peer, { DataConnection } from "peerjs";

export type ChatRoomProp = {
  roomName: string;
  connection?: DataConnection;
  peer?: Peer;
};

export const ChatRoom = (prop: ChatRoomProp): JSX.Element => {
  const { roomName, connection, peer } = prop;
  const newMessageContent = useSignal<string>("");

  const sendMessage = (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();

    const message = {
      sender: playerName.value,
      chatroom: roomName,
      content: newMessageContent.value,
      timestamp: new Date(),
    } as Message;

    sendChatMessage(roomName, message);
  };

  if (!roomName || chatHistory.value === undefined) {
    return <div>You need to create a room first</div>;
  }

  return (
    <div class="chat-room">
      <div class="message-list">
        {chatHistory.value.map((message) => {
          return (
            <div>
              <div>
                {message.sender} @ time:{" "}
                {new Date(message.timestamp).toDateString()}
              </div>
              <div>{message.content}</div>
              <div>--------------------------------</div>
            </div>
          );
        })}
      </div>
      <form onSubmit={(e) => sendMessage(e)}>
        <input
          type="text"
          value={newMessageContent}
          onChange={(e) =>
            (newMessageContent.value = (e.target as HTMLInputElement).value)
          }
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
