// @ts-nocheck

const gameBoardEl = document.querySelector("#game-board");
const playerListEl = document.querySelector("#player-list");
const resultEl = document.querySelector("#result");
const joinButtonEl = document.querySelector("#join-button");
const endButtonEl = document.querySelector("#end-button");

/** Current player info `{id, name, isHost}` */
let player = null;

let hostPlayerId = null;

let playerList = null;

/** All players id -> {name, playAs} */
let playerMap = null;

/** `'x'`, `'o'`, `'-'`, or `null` */
let winner = null;

let hasRoundStarted = false;

function initialize() {
  handleMessages();
  gameBoardEl.addEventListener("cellSelect", ({ detail }) => {
    sendGameStateMessage(
      "move",
      { index: detail.index, playAs: gameBoardEl.playAs },
      player.isHost ? hostPlayerId : void 0
    );
  });
  joinButtonEl.addEventListener("click", () => {
    sendGameStateMessage(
      "join",
      { from: player.id },
      player.isHost ? hostPlayerId : void 0
    );
  });
  endButtonEl.addEventListener("click", () => {
    endRound();
  });
}

function startRound(isFromMessage) {
  if (hasRoundStarted) return;
  gameBoardEl?.cleanUp();
  gameBoardEl.disabled = getPlayerOnTurn() !== playerMap.get(player.id)?.playAs;
  gameBoardEl.playAs = playerMap.get(player.id)?.playAs;
  winner = null;
  resultEl.textContent = "";
  hasRoundStarted = true;
  endButtonEl.hidden = !playerMap.get(player.id)?.playAs;
  joinButtonEl.hidden = true;
  if (!isFromMessage) {
    sendGameStateMessage("start_round", void 0, [
      ...playerMap.keys().filter((id) => id !== player.id),
    ]);
  }
}

function endRound(isFromMessage) {
  if (!hasRoundStarted) return;
  switch (winner) {
    case "x":
    case "o":
      resultEl.textContent = `${
        [...playerMap.values()].find(({ playAs }) => playAs === winner)?.name
      } (${winner.toUpperCase()}) won!`;
      break;
    case "-":
      resultEl.textContent = `It is a draw!`;
      break;
    default:
      resultEl.textContent = "";
      break;
  }
  playerMap.values().forEach((d) => (d.playAs = null));
  gameBoardEl.disabled = true;
  hasRoundStarted = false;
  endButtonEl.hidden = true;
  joinButtonEl.hidden = false;
  if (!isFromMessage) {
    sendGameStateMessage("end_round", void 0, [
      ...playerMap.keys().filter((id) => id !== player.id),
    ]);
  }
}

function getWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // cols
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  for (const [a, b, c] of lines) {
    const value = board[a];
    if (value && value === board[b] && value === board[c]) {
      return value;
    }
  }

  return board.includes(null) ? null : "-";
}

function getPlayerOnTurn() {
  return gameBoardEl.board.filter(Boolean).length % 2 === 0 ? "x" : "o";
}

function handleMessages() {
  window.addEventListener("message", (event) => {
    const msg = event.data;
    if (!msg) return;
    switch (msg.type) {
      case "_player_info":
        player = msg.value;
        handlePlayerMapUpdate();
        break;
      case "_host_player":
        hostPlayerId = msg.value;
        handlePlayerMapUpdate();
        break;
      case "_player_list":
        playerList = msg.value;
        handlePlayerMapUpdate();
        break;
      case "join": {
        if (playerMap.get(msg.value?.from)?.playAs) return;
        const count = [...playerMap.values().filter(({ playAs }) => playAs)]
          .length;
        if (count >= 2) return;
        const playerStatus = playerMap.get(msg.value?.from);
        if (!playerStatus) return;
        playerStatus.playAs = count === 0 ? "x" : "o";
        handlePlayerMapUpdate();
        break;
      }
      case "player-map":
        playerMap = new Map(msg.value);
        handlePlayerMapUpdate();
        break;
      case "move": {
        const board = gameBoardEl.board;
        const { index, playAs } = msg.value;
        board[index] = playAs;
        gameBoardEl.board = [...board];
        if (player.isHost) {
          sendGameStateMessage("board", gameBoardEl.board, [
            ...playerMap.keys(),
          ]);
        }
        break;
      }
      case "board": {
        gameBoardEl.board = msg.value;
        const playerOnTurn = getPlayerOnTurn();
        gameBoardEl.disabled =
          playerOnTurn !== playerMap.get(player.id)?.playAs;
        if ((winner = getWinner(gameBoardEl.board))) {
          endRound();
          return;
        }
        break;
      }
      case "start_round":
        startRound(true);
        break;
      case "end_round":
        endRound(true);
        break;
    }
  });
}

function sendGameStateMessage(type, value, to) {
  self.parent.postMessage(
    {
      type,
      to,
      value,
    },
    "*"
  );
}

function handlePlayerMapUpdate() {
  if (!player || !hostPlayerId || !playerList) return;
  if (!playerMap) {
    playerMap = new Map(
      playerList.map(([id, name]) => [
        id,
        { name, isHost: id === hostPlayerId },
      ])
    );
  }
  playerListEl.playerMap = playerMap;
  if (player.isHost) {
    sendGameStateMessage(
      "player-map",
      [...playerMap],
      [...playerMap.keys().filter((id) => id !== player.id)]
    );
  }
  joinButtonEl.hidden = hasRoundStarted;
  const count = [...playerMap.values().filter(({ playAs }) => playAs)].length;
  if (count < 2) return;
  startRound();
}

initialize();
