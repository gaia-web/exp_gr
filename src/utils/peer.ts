import { computed, effect, signal } from "@preact/signals";
import Peer, { DataConnection, PeerError, PeerJSOption } from "peerjs";
import { exitRoom, hostId, playerMap, playerName } from "./session";
import {
  boardcastMessage,
  handleMessage,
  MessageType,
  sendMessage,
} from "./message";

export const PEER_ID_PREFIX = "1uX68Fu0mzVKNp5h";
export const PEER_JS_OPTIONS: PeerJSOption = { debug: 0 };

export const peer = signal<Peer>();
export const isHost = computed(() => peer.value.id === hostId.value);
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

export function boardcastPlayerList() {
  if (!isHost.value) return;
  const playerIdAndNamePairs = [...playerMap.value];
  boardcastMessage(() => ({
    type: MessageType.PLAYER_LIST,
    value: playerIdAndNamePairs,
  }));
}

effect(() => {
  const p = peer.value;
  if (!p) return;
  p.off("error")
    .on("error", (e) => handleErrors(e))
    .off("connection")
    .on("connection", (c) => handleConnectionToTheHost(c))
    .off("open")
    .on("open", () => handleNonHostPeerOpened(p));
});

// TODO: use better name to indicate this is for hosts to handle the incoming connection from clients
function handleConnectionToTheHost(c: DataConnection) {
  if (!isHost.value) return;
  applyMessageHandler(c);
  connectionMap.value = new Map([...connectionMap.value, [c.peer, c]]);
  c.off("open").on("open", () => {
    console.info(`New player ${c.peer} joined.`);
    sendPlayerName(c);
    boardcastPlayerList();
  });
}

function handleNonHostPeerOpened(p: Peer) {
  if (isHost.value) return;
  const connection = p.connect(hostId.value);
  connection.on("open", () => {
    connectionMap.value = new Map([
      ...connectionMap.value,
      [connection.peer, connection],
    ]);
    sendPlayerName(connection);
  });
  applyMessageHandler(connection);
}

function handleErrors(e: PeerError<string>) {
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

// TODO handle disconnections
// TODO should not allow same player names
