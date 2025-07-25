import { useSignalEffect } from "@preact/signals";
import { useLocation } from "preact-iso";
import { peer } from "../../utils/peer";
import { pageTranstionResolver } from "../../utils/view-transition";
import { sendGamePick, gamePickMap } from "../../utils/game-pick";
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
    sendGamePick(-1);
  }, []);

  useSignalEffect(() => {
    pageTranstionResolver.value?.("");
    pageTranstionResolver.value = void 0;
  });

  useSignalEffect(() => {
    pageTranstionResolver.value?.("");
    pageTranstionResolver.value = void 0;
  });

  useSignalEffect(() => {
    if (!peer.value) {
      alert("Connection lost or timed out, exiting room...");
      route("/", true);
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
              sendGamePick(index);
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
