import { useSignalEffect } from "@preact/signals";
import { useLocation, useRoute } from "preact-iso";
import { peer } from "../../utils/peer";
import { chatMessageHistory, sendChatMessage } from "../../utils/chat";
import { playerMap } from "../../utils/session";
import "./style.css";

export function Chatting() {
  const { route } = useLocation();

  useSignalEffect(() => {
    if (!peer.value) {
      alert("Connection lost or timed out, exiting room...");
      route("/");
    }
  });

  return (
    <div class="chatting">
      <div class="neumo hollow message-container">
        <div style={{ fontSize: "1.5em" }}>Messages</div>
        <ul class="message-list">
          {chatMessageHistory.value.map(({ senderId, content, timestamp }) => (
            <li class="message-item neumo">
              <div class="message-item-player-label neumo hollow">
                {playerMap.value.get(senderId) ?? "Unknown Player"}
              </div>
              <div class="message-item-content">
                <p> {content}</p>
                <i>{timestamp}</i>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <form
        class="input-form"
        onSubmit={(e) => {
          e.preventDefault();
          sendChatMessage(e.target["content"].value);
        }}
      >
        <textarea
          class="neumo"
          name="content"
          placeholder="Type a message..."
        />
        <button class="neumo" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}
