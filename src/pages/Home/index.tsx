import { useLocation } from "preact-iso";
import { useSignalEffect } from "@preact/signals";
import { peer } from "../../utils/peer";
import {
  createRoom,
  joinRoom,
  playerName,
  roomName,
} from "../../utils/session";
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
          switch (e.submitter["value"]) {
            case "join":
              joinRoom();
              break;
            case "create":
              createRoom();
              break;
          }
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
        <button type="submit" name="action" value="join" class="neumo">
          <b>Join Room</b>
        </button>
        <button type="submit" name="action" value="create" class="neumo">
          Create Room
        </button>
      </form>
    </section>
  );
}
