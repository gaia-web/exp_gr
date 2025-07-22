import { useSignalEffect } from "@preact/signals";
import { useLocation } from "preact-iso";
import { peer } from "../../utils/peer";
import { sendGamePickMessage } from "../../utils/game-pick";
import { playerMap } from "../../utils/session";

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

  useSignalEffect(() => {
    if (!peer.value) {
      alert("Connection lost or timed out, exiting room...");
      route("/");
    }
  });

  return (
    <section class="game-list page">
      <h2>Select a Game</h2>
      <div class="game-options">
        {games.map((game, index) => (
          <div
            class="neumo hollow card"
            onClick={() => {
              sendGamePickMessage(index);
            }}
          >
            <p>
              {game}:
              {[...playerMap.value]
                .filter(
                  ([_, playerState]) => playerState.gamePickedIndex === index
                )
                .map(([_, playerState]) => playerState.name)
                .join(", ")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
