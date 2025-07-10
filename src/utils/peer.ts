import { batch, computed, effect, signal } from "@preact/signals";
import Peer, { DataConnection, PeerError, PeerJSOption } from "peerjs";
import { exitRoom, hostId, playerMap, playerName } from "./session";
import { handleMessage, MessageType, sendMessage } from "./message";

export const PEER_ID_PREFIX = "1uX68Fu0mzVKNp5h";
export const PEER_JS_OPTIONS: PeerJSOption = { debug: 0 };

export const peer = signal<Peer>();
export const isHost = computed(() => peer.value?.id === hostId.value);
export const connectionMap = signal<Map<string, DataConnection>>(new Map());
export const connectionToTheHost = computed(() =>
  connectionMap.value.get(hostId.value)
);

function applyMessageHandler(c: DataConnection) {
  c.off("data").on("data", (data) => handleMessage(data, c));
}

function sendPlayerName(c: DataConnection) {
  sendMessage(c, {
    type: MessageType.PLAYER_NAME,
    value: playerName.value,
  });
}

effect(() => {
  addListenersToPeer();
});

function addListenersToPeer() {
  const p = peer.value;
  if (!p) return;
  p.off("error")
    .on("error", (e) => handlePeerError(e))
    .off("connection")
    .on("connection", (c) => handleReceivedPeerConnection(c))
    .off("disconnected")
    .on("disconnected", () => handlePeerDisconnectedFromTheServer(p))
    .off("open")
    .on("open", () => handlePeerOpened(p));
}

function handleReceivedPeerConnection(c: DataConnection) {
  if (!isHost.value) return;
  handleReceivedPeerConnectionToTheHost(c);
}

function handlePeerDisconnectedFromTheServer(p: Peer) {
  // TODO set a counter and limit times to reconnect, then destory it
  p.reconnect();
}

function handlePeerOpened(p: Peer) {
  if (isHost.value) return;
  handleNonHostPeerOpen(p);
}

function handlePeerError(e: PeerError<string>) {
  switch (e.type) {
    case "unavailable-id":
      exitRoom();
      alert(
        "Room with this name has already been created. You may want to join instead."
      );
      break;
    default:
      console.error(e);
      break;
  }
}

function handleConnectionOpened(c: DataConnection) {
  if (isHost.value) {
    console.info(`New player ${c.peer} joined.`);
    return;
  }
  HandleNonHostConnectionOpened(c);
}

function handleConnectionClosed(c: DataConnection) {
  if (!isHost.value) {
    exitRoom();
    return;
  }
  HandleHostConnectionClosed(c);
}

function handleReceivedPeerConnectionToTheHost(c: DataConnection) {
  applyMessageHandler(c);
  connectionMap.value = new Map([...connectionMap.value, [c.peer, c]]);
  c.off("open")
    .on("open", () => {
      handleConnectionOpened(c);
    })
    .off("close")
    .on("close", () => handleConnectionClosed(c));
}

function handleNonHostPeerOpen(p: Peer) {
  const connection = p.connect(hostId.value);
  connection
    .off("open")
    .on("open", () => {
      handleConnectionOpened(connection);
    })
    .off("close")
    .on("close", () => handleConnectionClosed(connection));
  applyMessageHandler(connection);
}

function HandleNonHostConnectionOpened(c: DataConnection) {
  connectionMap.value = new Map([...connectionMap.value, [c.peer, c]]);
  sendPlayerName(c);
}

function HandleHostConnectionClosed(c: DataConnection) {
  const peerId = c.peer;
  batch(() => {
    connectionMap.value.delete(peerId);
    connectionMap.value = new Map(connectionMap.value);
    playerMap.value.delete(peerId);
    playerMap.value = new Map(playerMap.value);
  });
}
