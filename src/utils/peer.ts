import { computed, effect, signal } from "@preact/signals";
import Peer, { DataConnection, PeerError, PeerJSOption } from "peerjs";
import { exitRoom, hostId, playerMap, playerName } from "./session";

export const PEER_ID_PREFIX = "1uX68Fu0mzVKNp5h";
export const PEER_JS_OPTIONS: PeerJSOption = { debug: 0 };

enum DataType {
  UPDATE_PLAYER_NAME = "update_player_name",
  UPDATE_PLAYER_LIST = "update_player_list",
}

export const peer = signal<Peer>();
export const isHost = computed(() => peer.value.id === hostId.value);
export const connectionMap = signal<Map<string, DataConnection>>(new Map());
export const dataHandler = signal<
  (data: { type?: string; value?: unknown }, connection: DataConnection) => void
>((data, connection) => {
  switch (data.type) {
    case DataType.UPDATE_PLAYER_NAME:
      if (!data) break;
      if (!isHost.value) break;
      playerMap.value = new Map([
        ...playerMap.value,
        [connection.connectionId, data.value.toString()],
      ]);
      console.info(`Peer ${connection.peer} updated its name as ${data.value}`);
      notifyPlayerListUpdate();
      break;
    case DataType.UPDATE_PLAYER_LIST:
      console.info(`Player list updated as: `, data.value);
      playerMap.value = new Map(data.value as [string, string][]);
      break;
  }
});

function updateDataHandler(c: DataConnection) {
  c.off("data").on("data", (data) => dataHandler.value?.(data, c));
}

function sendPlayerName(c: DataConnection) {
  c.send({ type: DataType.UPDATE_PLAYER_NAME, value: playerName.value });
}

function notifyPlayerListUpdate() {
  if (!isHost.value) return;
  const playerIdAndNamePairs = [...playerMap.value.entries()];
  for (const [_, c] of connectionMap.value) {
    c.send({
      type: DataType.UPDATE_PLAYER_LIST,
      value: playerIdAndNamePairs,
    });
  }
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

effect(() => {
  if (!connectionMap?.value) return;
  for (const [_, c] of connectionMap.value) {
    updateDataHandler(c);
  }
});

function handleConnectionToTheHost(c: DataConnection) {
  if (!isHost.value) return;
  updateDataHandler(c);
  connectionMap.value = new Map([...connectionMap.value, [c.connectionId, c]]);
  c.off("open").on("open", () => {
    console.info(`New player ${c.peer} joined.`);
    sendPlayerName(c);
    notifyPlayerListUpdate();
  });
}

function handleNonHostPeerOpened(p: Peer) {
  if (isHost.value) return;
  const connection = p.connect(hostId.value);
  connection.on("open", () => {
    sendPlayerName(connection);
  });
  connectionMap.value = new Map([
    ...connectionMap.value,
    [connection.connectionId, connection],
  ]);
}

function handleErrors(e: PeerError<string>) {
  switch (e.type) {
    case "unavailable-id":
      exitRoom();
      alert(
        "Room with this name has already been created. You may want to join instead."
      );
      break;
  }
}

// TODO handle disconnections
