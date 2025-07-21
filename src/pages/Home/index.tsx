import { useLocation } from "preact-iso";
import { useSignalEffect } from "@preact/signals";
import { peer } from "../../utils/peer";
import { enterRoom, playerName, roomName } from "../../utils/session";
import "./style.css";
import {
  pageTranstionResolver,
  startViewTransition,
} from "../../utils/view-transition";
import { vibrateForButtonClick } from "../../utils/vibration";

export function Home() {
  const { route } = useLocation();

  useSignalEffect(() => {
    pageTranstionResolver.value?.("");
    pageTranstionResolver.value = void 0;
  });

  useSignalEffect(() => {
    if (!peer.value) return;
    route(`/room/${encodeURIComponent(roomName.value)}/players`, true);
  });

  return (
    <section class="home page">
      <form
        class="card neumo"
        onSubmit={(e) => {
          e.preventDefault();
          (e.target as HTMLElement).style.viewTransitionName = "home-page";
          startViewTransition(
            async () => {
              enterRoom();
              await new Promise((resolve) => {
                (e.target as HTMLElement).style.viewTransitionName = "";
                pageTranstionResolver.value = resolve;
              });
              (
                document.querySelector("main") as HTMLElement
              ).style.viewTransitionName = "home-page";
            },
            void 0,
            () => {
              (
                document.querySelector("main") as HTMLElement
              ).style.viewTransitionName = "";
            }
          );
        }}
      >
        <input
          name="room-name"
          required
          pattern="^[\w]+$"
          title="Use only letters, numbers, and underscores."
          class="neumo"
          placeholder="Enter room name here"
          onChange={({ currentTarget }) =>
            (roomName.value = currentTarget.value?.trim())
          }
        />
        <input
          name="player-name"
          required
          class="neumo"
          placeholder="Enter player name here"
          onChange={({ currentTarget }) =>
            (playerName.value = currentTarget.value)
          }
        />
        <button
          type="submit"
          name="action"
          class="neumo"
          onClick={() => {
            vibrateForButtonClick();
          }}
        >
          <b>Enter Room</b>
        </button>
        <i style="text-align: center;">
          If the room does not exist, it would be created.
        </i>
      </form>
    </section>
  );
}
