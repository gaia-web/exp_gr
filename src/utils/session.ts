import Peer from "peerjs";
import { batch, computed, effect, signal } from "@preact/signals";
import { connectionMap, peer, PEER_ID_PREFIX, PEER_JS_OPTIONS } from "./peer";

export const hostId = computed(() => `${PEER_ID_PREFIX}-${roomName}`);
export const roomName = signal<string>();
export const playerName = signal<string>();
export const playerMap = signal<Map<string, string>>(new Map());

effect(() => {
  if (!peer.value) {
    exitRoom();
    return;
  }
});

export function createRoom() {
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
  console.info(
    `Create a room with name ${roomName} as ${playerName} and wait for players to join.`
  );
  playerMap.value = new Map([[peer.value.id, playerName.value]]);
}

export function joinRoom() {
  // TODO should prevent player to join a room that is not yet created
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
  console.info(`Join room ${roomName} as ${playerName}.`);
}

export function exitRoom() {
  batch(() => {
    roomName.value = void 0;
    playerName.value = void 0;
    playerMap.value = new Map();
    connectionMap.value = new Map();
    peer.value = void 0;
  });
}
