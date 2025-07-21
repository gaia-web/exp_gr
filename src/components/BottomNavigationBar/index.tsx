import { useLocation } from "preact-iso";
import { unreadChatMessages } from "../../utils/chat";
import { roomName, unreadPlayerListChanges } from "../../utils/session";
import {
  startViewTransition,
  pageTranstionResolver,
} from "../../utils/view-transition";
import "./style.css";
import { Joystick, List, MessagesSquare, Users } from "lucide-preact";

export function BottomNavigationBar() {
  const { url, route } = useLocation();

  return (
    <nav class="nav-bar neumo">
      <button
        title="Player List"
        class={`neumo ${
          url === `/room/${roomName.value}/players` ? "active hollow" : ""
        } ${unreadPlayerListChanges.value ? "attention" : ""}`}
        onClick={(e) =>
          pageViewTransitionHandler(
            `/room/${roomName.value}/players`,
            e.currentTarget
          )
        }
      >
        <Users />
      </button>
      <button
        title="Chats"
        class={`neumo ${
          url === `/room/${roomName.value}/chat` ? "active hollow" : ""
        } ${unreadChatMessages.value > 0 ? "attention" : ""}`}
        onClick={(e) =>
          pageViewTransitionHandler(
            `/room/${roomName.value}/chat`,
            e.currentTarget
          )
        }
      >
        <MessagesSquare />
      </button>
      <button
        title="Game List"
        class={`neumo ${
          url === `/room/${roomName.value}/games` ? "active hollow" : ""
        }`}
        onClick={(e) =>
          pageViewTransitionHandler(
            `/room/${roomName.value}/games`,
            e.currentTarget
          )
        }
      >
        <List />
      </button>
      <button
        title="Playing"
        class={`neumo ${
          url === `/room/${roomName.value}/play` ? "active hollow" : ""
        }`}
        onClick={(e) =>
          pageViewTransitionHandler(
            `/room/${roomName.value}/play`,
            e.currentTarget
          )
        }
      >
        <Joystick />
      </button>
      <div class="space-taker" />
    </nav>
  );

  function pageViewTransitionHandler(href: string, target: HTMLElement) {
    if (!href) return;
    // TODO select better view transition target
    target.style.viewTransitionName = "page-enter";
    (
      document.querySelector(
        ".waiting-room.page .content-container"
      ) as HTMLElement
    ).style.viewTransitionName = "page-leave";
    const previousButton = document.querySelector(
      ".waiting-room.page .nav-bar button.active"
    ) as HTMLElement;
    startViewTransition(
      async () => {
        target.style.viewTransitionName = "";
        route(href);
        await new Promise((resolve) => {
          pageTranstionResolver.value = resolve;
        });
        previousButton.style.viewTransitionName = "page-leave";
        (
          document.querySelector(
            ".waiting-room.page .content-container"
          ) as HTMLElement
        ).style.viewTransitionName = "page-enter";
      },
      void 0,
      () => {
        previousButton.style.viewTransitionName = "";
        (
          document.querySelector(
            ".waiting-room.page .content-container"
          ) as HTMLElement
        ).style.viewTransitionName = "";
      }
    );
  }
}
