import { useLocation } from "preact-iso";
import { unreadChatMessages$ } from "../../utils/chat";
import {
  exitRoom,
  roomName$,
  unreadPlayerListChanges$,
} from "../../utils/session";
import {
  startViewTransition,
  pageTranstionResolver$,
} from "../../utils/view-transition";
import "./style.css";
import { Joystick, List, LogOut, MessagesSquare, Users } from "lucide-preact";
import { vibrateForButtonClick } from "../../utils/vibration";
import { showAlert } from "../..";

export function NavigationBar() {
  const { url, route } = useLocation();

  return (
    <nav class="nav-bar neumo">
      <button
        title="Player List"
        class={`neumo ${
          url === `/room/${roomName$.value}/players` ? "active hollow" : ""
        } ${unreadPlayerListChanges$.value ? "attention" : ""}`}
        onClick={(e) =>
          pageViewTransitionHandler(
            `/room/${roomName$.value}/players`,
            e.currentTarget
          )
        }
      >
        <Users />
      </button>
      <button
        title="Chats"
        class={`neumo ${
          url === `/room/${roomName$.value}/chat` ? "active hollow" : ""
        } ${unreadChatMessages$.value > 0 ? "attention" : ""}`}
        onClick={(e) =>
          pageViewTransitionHandler(
            `/room/${roomName$.value}/chat`,
            e.currentTarget
          )
        }
      >
        <MessagesSquare />
      </button>
      <button
        title="Game List"
        class={`neumo ${
          url === `/room/${roomName$.value}/games` ? "active hollow" : ""
        }`}
        onClick={(e) =>
          pageViewTransitionHandler(
            `/room/${roomName$.value}/games`,
            e.currentTarget
          )
        }
      >
        <List />
      </button>
      <button
        title="Playing"
        class={`neumo ${
          url === `/room/${roomName$.value}/play` ? "active hollow" : ""
        }`}
        onClick={(e) =>
          pageViewTransitionHandler(
            `/room/${roomName$.value}/play`,
            e.currentTarget
          )
        }
      >
        <Joystick />
      </button>
      <button
        name="exit"
        title="Leave Room"
        class="neumo"
        style={{ marginRight: "auto" }}
        onClick={() => {
          vibrateForButtonClick();
          setTimeout(async () => {
            if (
              !(await showAlert({
                title: "Exiting room",
                content: "You sure you wanna leave the room?",
              }))
            )
              return;
            (
              document.querySelector("main") as HTMLElement
            ).style.viewTransitionName = "home-page";
            startViewTransition(
              async () => {
                (
                  document.querySelector("main") as HTMLElement
                ).style.viewTransitionName = "";
                route("/", true);
                exitRoom();
                await new Promise((resolve) => {
                  pageTranstionResolver$.value = resolve;
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
          });
        }}
      >
        <LogOut />
      </button>
      <div class="space-taker" />
    </nav>
  );

  function pageViewTransitionHandler(href: string, target: HTMLElement) {
    vibrateForButtonClick();
    if (!href) return;
    // TODO select better view transition target
    target.style.viewTransitionName = "page-enter";
    (
      document.querySelector(".room.page .content-container") as HTMLElement
    ).style.viewTransitionName = "page-leave";
    const previousButton = document.querySelector(
      ".room.page .nav-bar button.active"
    ) as HTMLElement;
    startViewTransition(
      async () => {
        target.style.viewTransitionName = "";
        route(href, true);
        await new Promise((resolve) => {
          pageTranstionResolver$.value = resolve;
        });
        previousButton.style.viewTransitionName = "page-leave";
        (
          document.querySelector(".room.page .content-container") as HTMLElement
        ).style.viewTransitionName = "page-enter";
      },
      void 0,
      () => {
        previousButton.style.viewTransitionName = "";
        (
          document.querySelector(".room.page .content-container") as HTMLElement
        ).style.viewTransitionName = "";
      }
    );
  }
}
