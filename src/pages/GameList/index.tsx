import { useSignalEffect } from "@preact/signals";
import { useLocation } from "preact-iso";
import { peer } from "../../utils/peer";
import {
  gamePickInit,
  gamePickMap,
  sendGamePickMessage,
} from "../../utils/game-pick";
import { playerMap } from "../../utils/session";
import { useEffect } from "preact/hooks";

// Sample list of games
const games = [
  "Tic-Tac-Toe",
  "Chess",
  "Checkers",
  "Rock Paper Scissors",
  "Connect Four",
];

export function GameList() {
  const { route } = useLocation();

  useEffect(() => {
    gamePickInit(-1);
  }, []);

  useSignalEffect(() => {
    if (!peer.value) {
      alert("Connection lost or timed out, exiting room...");
      route("/");
    }
  });

  console.log(
    "gamePickMap is now",
    [...gamePickMap.value].map((v) => v)
  );

  return (
    <section class="game-list page">
      <h2>Select a Game</h2>
      <div class="game-options">
        {games.map((game, index) => (
          <div
            class="neumo hollow card"
            onClick={() => {
              sendGamePickMessage(index);
              gamePickInit(index);
            }}
          >
            <p>
              {game}:
              {[...gamePickMap.value]
                .filter(([_, playerState]) => playerState === index)
                .map(([name, _]) => name)
                .join(", ")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
