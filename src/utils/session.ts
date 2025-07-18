import Peer, { PeerError } from "peerjs";
import { batch, computed, effect, signal } from "@preact/signals";
import {
  connectionMap,
  isHost,
  peer,
  PEER_ID_PREFIX,
  PEER_JS_OPTIONS,
} from "./peer";
import { boardcastMessage, MessageType } from "./message";

export type PlayerState = {
  name: string;
  gamePickedIndex: number;
};

export const hostId = computed(() => `${PEER_ID_PREFIX}-${roomName}`);
export const roomName = signal<string>();
export const playerName = signal<string>();
export const playerMap = signal<Map<string, PlayerState>>(new Map());
export const unreadPlayerListChanges = signal(false);

effect(() => {
  if (!peer.value) {
    exitRoom();
    return;
  }
});

effect(() => {
  if (!playerMap.value) return;
  unreadPlayerListChanges.value = true;

  if (!isHost.value) return;
  boardcastPlayerList();
});

export function enterRoom() {
  if (!roomName.value) {
    alert("A room name is required.");
    return;
  }
  if (!playerName.value) {
    alert("A player name is required.");
    return;
  }
  peer.value?.destroy();
  peer.value = new Peer(hostId.value, PEER_JS_OPTIONS);
  const errorHandler = (e: PeerError<string>) => {
    switch (e.type) {
      case "unavailable-id":
        peer.value?.destroy();
        peer.value = new Peer(PEER_JS_OPTIONS);
        console.info(`Join room ${roomName} as ${playerName}.`);
        break;
    }
  };
  const openHandler = () => {
    console.info(
      `Create a room with name ${roomName} as ${playerName} and wait for players to join.`
    );
    playerMap.value = new Map([
      [peer.value.id, { name: playerName.value, gamePickedIndex: -1 }],
    ]);
    peer.value?.off("error", errorHandler).off("open", openHandler);
  };
  peer.value.on("error", errorHandler).on("open", openHandler);
}

export function exitRoom() {
  batch(() => {
    roomName.value = void 0;
    playerName.value = void 0;
    playerMap.value = new Map();
    connectionMap.value = new Map();
    peer.value?.destroy();
    peer.value = void 0;
  });
}

export function boardcastPlayerList() {
  if (!isHost.value) return;
  console.log("I broad casted " ,[...playerMap.value])
  const playerIdAndStatesPairs = [...playerMap.value];
  boardcastMessage(() => ({
    type: MessageType.PLAYER_LIST,
    value: playerIdAndStatesPairs,
  }));
}