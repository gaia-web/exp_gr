import { useLocation } from "preact-iso";

import "./style.css";
import { exitRoom, roomName } from "../../utils/session";

export function Header() {
  const { url } = useLocation();

  const isRootUrl = () => url === "" || url === "/";

  return (
    <header class={`neumo hollow ${isRootUrl() ? "collapsed" : ""}`}>
      <nav>
        <a
          href="/"
          class={`neumo ${url === "/" ? "active hollow" : ""}`}
          style={{ marginRight: "auto" }}
          onClick={() => {
            exitRoom();
          }}
        >
          Exit Room
        </a>
        <a
          href={`/room/${roomName.value}`}
          class={`neumo ${
            url === `/room/${roomName.value}` ? "active hollow" : ""
          }`}
        >
          Lounge
        </a>
        <a
          href={`/room/${roomName.value}/chat`}
          class={`neumo ${
            url === `/room/${roomName.value}/chat` ? "active hollow" : ""
          }`}
        >
          Chat
        </a>
        <a
          href="/int-test"
          class={`neumo ${url === "/int-test" ? "active hollow" : ""}`}
        >
          Integration Test
        </a>
        <a href="/404" class={`neumo ${url === "/404" ? "active hollow" : ""}`}>
          404
        </a>
      </nav>
    </header>
  );
}
