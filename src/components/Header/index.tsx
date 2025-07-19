import { useLocation } from "preact-iso";

import "./style.css";
import {
  exitRoom,
  roomName,
  unreadPlayerListChanges,
} from "../../utils/session";
import { unreadChatMessages } from "../../utils/chat";
import {
  pageTranstionResolver,
  startViewTransition,
} from "../../utils/view-transition";

export function Header() {
  const { url, route } = useLocation();

  const isRootUrl = () => url === "" || url === "/";

  const pageViewTransitionHandler = () => {
    (document.querySelector("main") as HTMLElement).style.viewTransitionName =
      "page";
    startViewTransition(
      async () => {
        await new Promise((resolve) => {
          pageTranstionResolver.value = resolve;
        });
      },
      void 0,
      () => {
        (
          document.querySelector("main") as HTMLElement
        ).style.viewTransitionName = "";
      }
    );
  };

  return (
    <header class={`neumo hollow ${isRootUrl() ? "collapsed" : ""}`}>
      <nav>
        <div class="left-group">
          <button
            class="neumo"
            style={{ marginRight: "auto" }}
            onClick={() => {
              (
                document.querySelector("main") as HTMLElement
              ).style.viewTransitionName = "home-page";
              startViewTransition(
                async () => {
                  (
                    document.querySelector("main") as HTMLElement
                  ).style.viewTransitionName = "";
                  route("/");
                  exitRoom();
                  await new Promise((resolve) => {
                    pageTranstionResolver.value = resolve;
                  });
                  (
                    document.querySelector(".page form.card") as HTMLElement
                  ).style.viewTransitionName = "home-page";
                },
                void 0,
                () => {
                  (
                    document.querySelector(".page form.card") as HTMLElement
                  ).style.viewTransitionName = "";
                }
              );
            }}
          >
            Exit
          </button>
        </div>
        <div class="right-group">
          <div class="scroll-helper">
            <a
              href={`/room/${roomName.value}/players`}
              class={`neumo ${
                url === `/room/${roomName.value}/players` ? "active hollow" : ""
              } ${unreadPlayerListChanges.value ? "attention" : ""}`}
              onClick={pageViewTransitionHandler}
            >
              Players
            </a>
            <a
              href={`/room/${roomName.value}/chat`}
              class={`neumo ${
                url === `/room/${roomName.value}/chat` ? "active hollow" : ""
              } ${unreadChatMessages.value > 0 ? "attention" : ""}`}
              onClick={pageViewTransitionHandler}
            >
              Chat
            </a>
            <a
              href={`/room/${roomName.value}/games`}
              class={`neumo ${
                url === `/room/${roomName.value}/games` ? "active hollow" : ""
              }`}
              onClick={pageViewTransitionHandler}
            >
              Games
            </a>
            <a
              href={`/room/${roomName.value}/play`}
              class={`neumo ${
                url === `/room/${roomName.value}/play` ? "active hollow" : ""
              }`}
              onClick={pageViewTransitionHandler}
            >
              Play
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
