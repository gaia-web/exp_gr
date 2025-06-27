import { Peer, DataConnection } from "peerjs";
import {
  connectionMap,
  peer,
  PEER_ID_PREFIX,
  PEER_JS_OPTIONS,
  playerCount,
  playerList,
  playerName,
  roomName,
} from "../../utils/peer";
import { useSignal, useSignalEffect } from "@preact/signals";

export function PeerTest() {
  const currentConnections = useSignal<DataConnection[]>([]);

  useSignalEffect(() => {
    if (peer.value) {
      peer.value.on("connection", (conn) => {
        console.log(`Peer ${conn.peer} connected`);
        currentConnections.value = [...currentConnections.value, conn];
        conn.on("close", () => {
          console.log(`Peer ${conn.peer} disconnected`);
          currentConnections.value = currentConnections.value.filter(
            (c) => c.peer !== conn.peer
          );
        });
      });
    }
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
      <br />
      <b>Current Connections:</b>
      <ul>
        <li key={playerName.value}>You: {playerName.value}</li>
        <li key={playerCount}>Total player count: {playerCount}</li>

        {playerList.value.map((value) => (
          <li key={value}>{value}</li>
        ))}
      </ul>
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
    playerList.value = [playerName.value];
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
