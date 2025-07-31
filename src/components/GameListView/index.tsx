import { useSignalEffect } from "@preact/signals";
import { useLocation } from "preact-iso";
import { peer$ } from "../../utils/peer";
import { pageTranstionResolver$ } from "../../utils/view-transition";
import { sendGamePick, gamePickMap$ } from "../../utils/game-pick";
import { useEffect } from "preact/hooks";
import { DEFAULT_GAME_LIST, currentGamePluginSrc$ } from "../../utils/game";
import { roomName$ } from "../../utils/session";

// Sample list of games
const games = [
  "Tic-Tac-Toe",
  "Chess",
  "Checkers",
  "Rock Paper Scissors",
  "Connect Four",
];

export function GameListView() {
  const { route } = useLocation();

  useEffect(() => {
    sendGamePick(-1);
  }, []);

  useSignalEffect(() => {
    pageTranstionResolver$.value?.("");
    pageTranstionResolver$.value = void 0;
  });

  return (
    <section class="game-list view">
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
              {[...gamePickMap$.value]
                .filter(([_, playerState]) => playerState === index)
                .map(([name, _]) => name)
                .join(", ")}
            </p>
          </div>
        ))}
      </div>
      <div
        class="neumo hollow"
        style={{ "--neumo-item-background-color": "hsl(0, 50%, 50%)" }}
      >
        <b>This is a temp selection</b>
        <br />
        {DEFAULT_GAME_LIST.map(
          ({ label, description, playerLimit, pluginUrl }) => (
            <button
              class="neumo"
              onClick={() => {
                currentGamePluginSrc$.value = pluginUrl;
                route(`/room/${encodeURIComponent(roomName$.value)}/play`, true);
              }}
            >
              <div>
                <b>{label}</b>
                &nbsp;
                <i>
                  ({playerLimit[0] ?? "N/A"} - {playerLimit[1] ?? "N/A"})
                </i>
                <br />
                <span>{description}</span>
              </div>
            </button>
          )
        )}
      </div>
    </section>
  );
}
