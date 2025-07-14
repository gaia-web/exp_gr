import { useLocation } from "preact-iso";
import { useSignalEffect } from "@preact/signals";
import { peer } from "../../utils/peer";
import { enterRoom, playerName, roomName } from "../../utils/session";
import "./style.css";

export function Home() {
  const { route } = useLocation();

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
          enterRoom();
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
        <button type="submit" name="action" class="neumo">
          Enter Room
        </button>
        <i style="text-align: center;">
          If the room does not exist, it would be created.
        </i>
      </form>
    </section>
  );
}
