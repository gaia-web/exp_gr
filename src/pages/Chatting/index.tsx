import { useSignalEffect } from "@preact/signals";
import { useLocation } from "preact-iso";
import { peer } from "../../utils/peer";
import {
  chatMessageHistory,
  sendChatMessage,
  unreadChatMessages,
} from "../../utils/chat";
import { playerMap } from "../../utils/session";
import "./style.css";
import { useSignalRef } from "@preact/signals/utils";

export function Chatting() {
  const { route } = useLocation();
  const chatMessageListRef = useSignalRef<HTMLUListElement>(void 0);

  useSignalEffect(() => {
    if (!peer.value) {
      alert("Connection lost or timed out, exiting room...");
      route("/");
    }
  });

  useSignalEffect(() => {
    if (chatMessageHistory.value.length <= 0) return;
    const el = chatMessageListRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
    unreadChatMessages.value = 0;
  });

  return (
    <section class="chatting page">
      <div class="neumo hollow message-container">
        <div style={{ fontSize: "1.5em" }}>Messages</div>
        <ul class="message-list" ref={chatMessageListRef}>
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
    </section>
  );
}
