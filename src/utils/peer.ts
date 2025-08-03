import { batch, computed, effect, signal } from "@preact/signals";
import Peer, { DataConnection, PeerError, PeerJSOption } from "peerjs";
import { exitRoom, hostId$, playerMap$, playerName$ } from "./session";
import { handleMessage, MessageType, sendMessage } from "./message";
import { currentGameList$ } from "./game";

export const PEER_ID_PREFIX = "1uX68Fu0mzVKNp5h";
export const PEER_JS_OPTIONS: PeerJSOption = { debug: 0 };

export const peer$ = signal<Peer>();
export const isHost$ = computed(() => peer$.value?.id === hostId$.value);
export const connectionMap$ = signal<Map<string, DataConnection>>(new Map());
export const connectionToTheHost$ = computed(() =>
  connectionMap$.value.get(hostId$.value)
);

function applyMessageHandler(c: DataConnection) {
  c.off("data").on("data", (data) => handleMessage(data, c));
}

function sendPlayerName(c: DataConnection) {
  sendMessage(c, {
    type: MessageType.PLAYER_NAME,
    value: playerName$.value,
  });
}

effect(() => {
  if (!peer$.value) return;
  addListenersToPeer();
});

function addListenersToPeer() {
  const p = peer$.value;
  if (!p) return;
  p.on("error", (e) => handlePeerError(e))
    .on("connection", (c) => handleReceivedPeerConnection(c))
    .on("disconnected", () => handlePeerDisconnectedFromTheServer(p))
    .on("open", () => handlePeerOpened(p));
}

function handleReceivedPeerConnection(c: DataConnection) {
  if (!isHost$.value) return;
  handleReceivedPeerConnectionToTheHost(c);
}

function handlePeerDisconnectedFromTheServer(p: Peer) {
  // TODO set a counter and limit times to reconnect, then destory it
  if (!p.open || p.destroyed) return;
  p.reconnect();
}

function handlePeerOpened(p: Peer) {
  if (isHost$.value) return;
  handleNonHostPeerOpen(p);
}

function handlePeerError(e: PeerError<string>) {
  switch (e.type) {
    case "unavailable-id":
      break;
    default:
      console.error(e);
      break;
  }
}

function handleConnectionOpened(c: DataConnection) {
  if (isHost$.value) {
    handleHostConnectionOpened(c);
  } else {
    HandleNonHostConnectionOpened(c);
  }
}

function handleConnectionClosed(c: DataConnection) {
  if (isHost$.value) {
    HandleHostConnectionClosed(c);
  } else {
    handleNonHostConnectionClosed();
  }
}

function handleReceivedPeerConnectionToTheHost(c: DataConnection) {
  applyMessageHandler(c);
  connectionMap$.value = new Map(connectionMap$.value).set(c.peer, c);
  c.on("open", () => {
    handleConnectionOpened(c);
  }).on("close", () => handleConnectionClosed(c));
}

function handleNonHostPeerOpen(p: Peer) {
  const connection = p.connect(hostId$.value);
  connection
    .on("open", () => {
      handleConnectionOpened(connection);
    })
    .on("close", () => handleConnectionClosed(connection));
  applyMessageHandler(connection);
}

function handleHostConnectionOpened(c: DataConnection) {
  console.info(`New player ${c.peer} joined.`);
  sendMessage(c, {
    type: MessageType.GAME_LIST,
    value: currentGameList$.value,
  });
}

function HandleNonHostConnectionOpened(c: DataConnection) {
  connectionMap$.value = new Map(connectionMap$.value).set(c.peer, c);
  sendPlayerName(c);
}

function HandleHostConnectionClosed(c: DataConnection) {
  const peerId = c.peer;
  console.info(`Player ${c.peer} left.`);
  batch(() => {
    connectionMap$.value = new Map(
      (connectionMap$.value.delete(peerId), connectionMap$.value)
    );
    playerMap$.value = new Map(
      (playerMap$.value.delete(peerId), playerMap$.value)
    );
  });
}

function handleNonHostConnectionClosed() {
  exitRoom();
}
