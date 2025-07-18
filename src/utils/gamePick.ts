import { connectionToTheHost, isHost, peer } from "./peer";
import { MessageType, sendMessage } from "./message";
import { boardcastPlayerList, playerMap, playerName, PlayerState } from "./session";

export const GameList = [
  "Game 1",
  "Game 2",
  "Game 3",
  "Game 4"
]

export function sendGamePickMessage(gameIndex: number) {
  const message: PlayerState = {
    name: playerName.value,
    gamePickedIndex: gameIndex
  }

  playerMap.value.get(peer.value.id).gamePickedIndex = gameIndex;

  sendMessage(connectionToTheHost.value, {
    type: MessageType.GAME_PICK,
    value: message,
  });

  if(isHost.value) {
    boardcastPlayerList()
    playerMap.value = new Map(playerMap.value)
  }
}