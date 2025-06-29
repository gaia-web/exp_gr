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

    sendChatMessage( roomName, message);
    console.log("chathistory", chatHistory.value.get(roomName));
  };

  console.log("ok chatroom update");

  if (!roomName) {
    return <div>go get a room</div>;
  }

  if (!chatHistory.value.get(roomName)) {
    return <div>you gotta create a room first</div>;
  }

  return (
    <div class="chat-room">
      <div class="message-list">
        {chatHistory.value.get(roomName).map((message) => (
          <div
            className={`message ${
              message.sender === "You" ? "sent" : "received"
            }`}
          >
            <div className="message-sender">{message.sender}</div>
            <div className="message-text">{message.content}</div>
          </div>
        ))}
      </div>
      <form onSubmit={(e) => sendMessage(e)}>
        <input
          type="text"
          className="message-input"
          value={newMessageContent}
          onChange={(e) =>
            (newMessageContent.value = (e.target as HTMLInputElement).value)
          }
          placeholder="Type a message..."
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};
