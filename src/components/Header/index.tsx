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

  const shouldHideHeader = () =>
    url === "" || url === "/" || /^\/enter\/[^\/]+$/.test(url);

  const pageViewTransitionHandler = (href: string) => {
    if (!href) return;
    (document.querySelector("main") as HTMLElement).style.viewTransitionName =
      "page";
    startViewTransition(
      async () => {
        route(href);
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
    <header class={`neumo hollow ${shouldHideHeader() ? "collapsed" : ""}`}>
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
            <button
              class={`neumo ${
                url === `/room/${roomName.value}/players` ? "active hollow" : ""
              } ${unreadPlayerListChanges.value ? "attention" : ""}`}
              onClick={() =>
                pageViewTransitionHandler(`/room/${roomName.value}/players`)
              }
            >
              Players
            </button>
            <button
              class={`neumo ${
                url === `/room/${roomName.value}/chat` ? "active hollow" : ""
              } ${unreadChatMessages.value > 0 ? "attention" : ""}`}
              onClick={() =>
                pageViewTransitionHandler(`/room/${roomName.value}/chat`)
              }
            >
              Chat
            </button>
            <button
              class={`neumo ${
                url === `/room/${roomName.value}/games` ? "active hollow" : ""
              }`}
              onClick={() =>
                pageViewTransitionHandler(`/room/${roomName.value}/games`)
              }
            >
              Games
            </button>
            <button
              class={`neumo ${
                url === `/room/${roomName.value}/play` ? "active hollow" : ""
              }`}
              onClick={() =>
                pageViewTransitionHandler(`/room/${roomName.value}/play`)
              }
            >
              Play
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
