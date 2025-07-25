import { useLocation, useRoute } from "preact-iso";
import { useSignalEffect } from "@preact/signals";
import { peer } from "../../utils/peer";
import { enterRoom, playerName, roomName } from "../../utils/session";
import "./style.css";
import {
  pageTranstionResolver,
  startViewTransition,
} from "../../utils/view-transition";

export function Home() {
  const { route } = useLocation();
  const { params } = useRoute();

  useSignalEffect(() => {
    pageTranstionResolver.value?.("");
    pageTranstionResolver.value = void 0;
  });

  useSignalEffect(() => {
    if (!peer.value) return;
    route(`/room/${encodeURIComponent(roomName.value)}/players`);
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
          class="neumo"
          name="room-name"
          required
          type="text"
          pattern="^[\w]+$"
          title="Use only letters, numbers, and underscores."
          placeholder="Enter room name here"
          defaultValue={setInitialRoomName()}
          disabled={!!params?.roomName}
          onChange={({ currentTarget }) =>
            (roomName.value = currentTarget.value?.trim())
          }
        />
        <input
          class="neumo"
          name="player-name"
          required
          type="text"
          placeholder="Enter player name here"
          onChange={({ currentTarget }) =>
            (playerName.value = currentTarget.value)
          }
        />
        <button type="submit" name="action" class="neumo">
          Enter Room
        </button>
        <i style="text-align: center;">
          If the room does not exist, it would be created.
        </i>
      </form>
    </section>
  );

  function setInitialRoomName() {
    if (!params?.roomName) return null;
    roomName.value = params.roomName;
    return params.roomName;
  }
}
