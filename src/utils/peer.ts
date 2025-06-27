import { computed, effect, signal } from "@preact/signals";
import Peer, { DataConnection, PeerJSOption } from "peerjs";

export const PEER_ID_PREFIX = "1uX68Fu0mzVKNp5h";
export const PEER_JS_OPTIONS: PeerJSOption = { debug: 0 };

enum DataType {
  UPDATE_PLAYER_NAME = "update_player_name",
  UPDATE_PLAYER_LIST = "update_player_list",
}

export const peer = signal<Peer>();
export const isHostPeer = computed(() =>
  peer.value.id.startsWith(PEER_ID_PREFIX)
);
export const roomName = signal<string>();
export const playerName = signal<string>();
export const connectionMap = signal<Map<DataConnection, string>>(new Map());
export const playerList = signal<string[]>([]);
export const playerCount = computed(() => playerList.value.length);
export const dataHandler = signal<
  (data: { type?: string; value?: unknown }, connection: DataConnection) => void
>((data, connection) => {
  switch (data.type) {
    case DataType.UPDATE_PLAYER_NAME:
      if (!data) break;
      const map = new Map(connectionMap.value);
      map.set(connection, data.value.toString());
      connectionMap.value = map;
      console.log(`Peer ${connection.peer} updated its name as ${data.value}`);

      if (isHostPeer) {
        notifyPlayerListUpdate();
      }

      break;
    case DataType.UPDATE_PLAYER_LIST:
      console.log(`Player list updated as: `, data.value);
      playerList.value = structuredClone(
        (data.value as any[]).map((v) => v.playerName)
      );
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
  const connectionAndPlayerNamePairs = [...connectionMap.value.entries()];
  for (const [c] of connectionAndPlayerNamePairs) {
    c.send({
      type: DataType.UPDATE_PLAYER_LIST,
      value: [
        { id: peer.value.id, playerName: playerName.value },
        ...connectionAndPlayerNamePairs.map(([p, n]) => ({
          id: p.peer,
          playerName: n,
        })),
      ],
    });
  }
}

effect(() => {
  const p = peer.value;
  if (!p) return;
  p.off("error")
    .on("error", (e) => {
      if (e.type === "unavailable-id") {
        alert(
          "Room with this name has already been created. You may want to join instead."
        );
      }
    })
    .off("connection")
    .on("connection", (c) => {
      updateDataHandler(c);
      const map = new Map(connectionMap.value);
      map.set(c, c.connectionId);
      connectionMap.value = map;
      c.off("open").on("open", () => {
        console.log(`New player ${c.peer} joined.`);
        playerList.value.push(c.peer);
        sendPlayerName(c);
        notifyPlayerListUpdate();
      });
    });
  p.off("open").on("open", () => {
    if (!isHostPeer.value) {
      const connection = p.connect(`${PEER_ID_PREFIX}_${roomName}`);
      connection.on("open", () => {
        sendPlayerName(connection);
      });
      const map = new Map(connectionMap.value);
      map.set(connection, connection.connectionId);
      connectionMap.value = map;
    }
  });
});

effect(() => {
  for (const [c] of connectionMap.value) {
    updateDataHandler(c);
  }
});
