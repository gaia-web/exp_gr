import { useLocation } from "preact-iso";

import "./style.css";
import {
  exitRoom,
  roomName,
  unreadPlayerListChanges,
} from "../../utils/session";
import { unreadChatMessages } from "../../utils/chat";

export function Header() {
  const { url } = useLocation();

  const shouldHideHeader = () =>
    url === "" || url === "/" || /^\/enter\/[^\/]+$/.test(url);

  return (
    <header class={`neumo hollow ${shouldHideHeader() ? "collapsed" : ""}`}>
      <nav>
        <div class="left-group">
          <a
            href="/"
            class="neumo"
            style={{ marginRight: "auto" }}
            onClick={() => {
              exitRoom();
            }}
          >
            Exit
          </a>
        </div>
        <div class="right-group">
          <div class="scroll-helper">
            <a
              href={`/room/${roomName.value}/players`}
              class={`neumo ${
                url === `/room/${roomName.value}/players` ? "active hollow" : ""
              } ${unreadPlayerListChanges.value ? "attention" : ""}`}
            >
              Players
            </a>
            <a
              href={`/room/${roomName.value}/chat`}
              class={`neumo ${
                url === `/room/${roomName.value}/chat` ? "active hollow" : ""
              } ${unreadChatMessages.value > 0 ? "attention" : ""}`}
            >
              Chat
            </a>
            <a
              href={`/room/${roomName.value}/games`}
              class={`neumo ${
                url === `/room/${roomName.value}/games` ? "active hollow" : ""
              }`}
            >
              Games
            </a>
            <a
              href={`/room/${roomName.value}/play`}
              class={`neumo ${
                url === `/room/${roomName.value}/play` ? "active hollow" : ""
              }`}
            >
              Play
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
