import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import { DataConnection, Peer, PeerJSOption } from "peerjs";

const PEER_ID_PREFIX = "1uX68Fu0mzVKNp5h";
const PEER_JS_OPTIONS: PeerJSOption = { debug: 3 };

export function PeerTest() {
  const peer = useSignal<Peer>();
  const connection = useSignal<DataConnection>();
  const roomName = useSignal("");
  const trimmedRoomName = useComputed(() => roomName.value.trim());

  useSignalEffect(() => {
    const p = peer.value;
    if (!p) return;
    p.on("connection", (c) => {
      connection.value = c;
    });
  });

  useSignalEffect(() => {
    const c = connection.value;
    if (!c) return;
    c.on("open", () => {
      c.send("hi!");
    }).on("data", (d) => {
      alert(`Received:\n${d}`);
      const content = prompt(
        "Type something to send back (leave blank to break the loop)",
        ""
      );
      if (content) {
        c.send(content);
      }
    });
  });

  return (
    <div class="peer-test">
      <input
        class="neumo"
        placeholder="Enter room name here"
        onChange={({ currentTarget }) => (roomName.value = currentTarget.value)}
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

  function createRoom() {
    if (!roomName) {
      alert("A room name is required.");
      return;
    }
    peer.value?.destroy();
    peer.value = new Peer(
      `${PEER_ID_PREFIX}_${trimmedRoomName}`,
      PEER_JS_OPTIONS
    );
    if (peer.value) {
      alert("Room created, waiting for connection.");
    }
  }

  function joinRoom() {
    if (!roomName) {
      alert("A room name is required.");
      return;
    }
    peer.value?.destroy();
    peer.value = new Peer(PEER_JS_OPTIONS);
    if (!peer.value) return;
    peer.value.on("open", () => {
      connection.value = peer.value.connect(
        `${PEER_ID_PREFIX}_${trimmedRoomName}`
      );
      if (connection.value) {
        alert("Connected, sending hi~~");
      }
    });
  }
}
