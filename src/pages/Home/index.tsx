import { useLocation } from "preact-iso";
import { useSignalEffect } from "@preact/signals";
import { peer } from "../../utils/peer";
import {
  createRoom,
  joinRoom,
  playerName,
  roomName,
} from "../../utils/session";

export function Home() {
  const { route } = useLocation();

  useSignalEffect(() => {
    if (!peer.value) return;
    route(`/room/${encodeURIComponent(roomName.value)}/players`);
  });

  return (
    <div class="peer-test">
      <input
        class="neumo"
        placeholder="Enter room name here"
        onChange={({ currentTarget }) =>
          (roomName.value = currentTarget.value?.trim())
        }
      />
      <br />
      <input
        class="neumo"
        placeholder="Enter player name here"
        onChange={({ currentTarget }) =>
          (playerName.value = currentTarget.value)
        }
      />
      <br />
      <button class="neumo" onClick={createRoom}>
        Create Room
      </button>
      <br />
      <button class="neumo" onClick={joinRoom}>
        Join Room
      </button>
    </div>
  );
}

// TODO might want to use form
