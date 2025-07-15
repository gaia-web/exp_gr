import { signal, useSignalEffect } from "@preact/signals";
import { useLocation, useRoute } from "preact-iso";
import { peer } from "../../utils/peer";
import { useState } from "preact/hooks";
import { gamePickState, sendGamePickMessage } from "../../utils/gamePick";

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
  const { params } = useRoute();
  

  useSignalEffect(() => {
    if (!peer.value) {
      alert("Connection lost or timed out, exiting room...");
      route("/");
    }
  });
  const handleReady = () => {
    console.log(`Ready to send out ${selectedIndex}!`);
    if (selectedIndex !== -1) {
      // TODO: Navigate to game lobby or start the game
      // For example: route(`/lobby/${params.room}/${selectedGame.value}`);
      sendGamePickMessage(selectedIndex);
    }
  };

  for (const [key, value] of gamePickState.value.entries()) {
    console.log(`gamePickState.keys ${key}, value ${value}`);
  }

  const output = (index) => {
    let count = 0;
    for (const [key, value] of gamePickState.value.entries()) {
      console.log(key, value);
      if (value === index) {
        count++;
      }
    }
    return count;
  };

  const youselectedIndex = () => {
    let selected = -1;
    for (const [key, value] of gamePickState.value.entries()) {
      console.log(key, value);
      if (key === peer.value.id) {
        selected = value
        break
      }
    }

    return selected
  }

  const [selectedIndex, setSelectedIndex] = useState<number>(youselectedIndex);

  return (
    <section class="game-list page">
      <h2>Select a Game</h2>
      <div class="game-options">
        {/* <form> */}
        {games.map((game, index) => (
          <div>
            <input
              type="radio"
              id={game.toLowerCase()}
              name="game"
              value={game}
              checked={index === selectedIndex}
              onClick={() => {
                setSelectedIndex(index);
              }}
            />
            <label htmlFor={game.toLowerCase()}>
              {game}: | current picked{" "}
              {output(index)}
              {index === youselectedIndex() ? " (selected)" : ""}
            </label>
          </div>
        ))}
        <button
          className="ready-button"
          disabled={selectedIndex === -1}
          onClick={handleReady}
        >
          Ready
        </button>
        {/* <input type="radio" id="html" name="fav_language" value="HTML" />
          <label for="html">HTML</label>
          <input type="radio" id="css" name="fav_language" value="CSS" />
          <label for="css">CSS</label>
          <input
            type="radio"
            id="javascript"
            name="fav_language"
            value="JavaScript"
          />
          <label for="javascript">JavaScript</label> */}
        {/* {games.map((game, index) => (
            <div key={game} class="game-option">
              <input
                type="radio"
                id={game}
                name="game"
                value={index}
                checked={selectedGame.value === game}
                onChange={() => {
                  selectedGame.value = game;
                }}
              />
              <label htmlFor={game}>{index}</label>
            </div>
          ))}
          <button
            className="ready-button"
            disabled={!selectedGame.value}
            onClick={handleReady}
          >
            Ready
          </button> */}
        {/* </form> */}
      </div>
    </section>
  );
}
