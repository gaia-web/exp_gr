import { Peer } from "peerjs";
import {
  peer,
  PEER_ID_PREFIX,
  PEER_JS_OPTIONS,
  playerName,
  roomName,
} from "../../utils/peer";

export function PeerTest() {
  return (
    <div class="peer-test">
      <input
        class="neumo"
        placeholder="Enter room name here"
        onChange={({ currentTarget }) =>
          (roomName.value = currentTarget.value?.trim())
        }
      />
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
      <br />
      <b>Open console to see the output</b>
    </div>
  );

  function createRoom() {
    if (!roomName.value) {
      alert("A room name is required.");
      return;
    }
    if (!playerName.value) {
      alert("A player name is required.");
      return;
    }
    peer.value?.destroy();
    peer.value = new Peer(`${PEER_ID_PREFIX}_${roomName}`, PEER_JS_OPTIONS);
    console.log(
      `Create a room with name ${roomName} as ${playerName} and wait for players to join.`
    );
  }

  function joinRoom() {
    if (!roomName.value) {
      alert("A room name is required.");
      return;
    }
    if (!playerName.value) {
      alert("A player name is required.");
      return;
    }
    peer.value?.destroy();
    peer.value = new Peer(PEER_JS_OPTIONS);
    console.log(`Join room ${roomName} as ${playerName}.`);
  }
}
