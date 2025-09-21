import { useSignalEffect } from "@preact/signals";
import { useLocation } from "preact-iso";
import { peer$ } from "../../utils/peer";
import {
  chatMessageHistory$,
  sendChatMessage,
  unreadChatMessages$,
} from "../../utils/chat";
import { playerMap$ } from "../../utils/session";
import "./style.css";
import { useSignalRef } from "@preact/signals/utils";
import { resolvePageTransitionPromise } from "../../utils/view-transition";
import { Send } from "lucide-preact";
import WithVibration from "../WithViberation";

export function ChattingView() {
  const chatMessageListRef$ = useSignalRef<HTMLUListElement>(void 0);

  useSignalEffect(resolvePageTransitionPromise);
  useSignalEffect(handleNewChatMessage);

  return (
    <section class="chatting view">
      <div class="neumo hollow message-container">
        <div style={{ fontSize: "1.5em" }}>Messages</div>
        <ul class="message-list" ref={chatMessageListRef$}>
          {chatMessageHistory$.value.map(({ senderId, content, timestamp }) => (
            <li class="message-item neumo">
              <div class="message-item-player-label neumo hollow">
                {playerMap$.value.get(senderId) ?? "Unknown Player"}
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
          (e.target as HTMLFormElement).reset();
        }}
      >
        <textarea
          class="neumo"
          name="content"
          placeholder="Type a message..."
        />
        <WithVibration.Button title="Send" class="neumo" type="submit">
          <Send />
        </WithVibration.Button>
      </form>
    </section>
  );

  function handleNewChatMessage() {
    if (chatMessageHistory$.value.length <= 0) return;
    const el = chatMessageListRef$.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
    unreadChatMessages$.value = 0;
  }
}
