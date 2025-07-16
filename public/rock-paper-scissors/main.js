// @ts-nocheck

const ROUND_DURATION = 10 * 1000; // 10 seconds

const moveButtons = document.querySelectorAll(
  "#move-buttons button[data-move]"
);
const statusEl = document.getElementById("status");
const timerEl = document.getElementById("timer");
const playerListEl = document.getElementById("player-list");

let player = null; // { id, name, isHost }
let playerMap = new Map();

// Round state (host authoritative)
let roundActive = false;
let roundStartTime = null;
let moves = new Map();
let roundResult = null;

let countdownInterval = null;
let hostTimerTimeout = null;

function renderPlayerList() {
  playerListEl.innerHTML = "";
  for (const [id, name] of playerMap.entries()) {
    const moved = moves.has(id);
    const li = document.createElement("li");
    li.textContent = `${name}${moved ? " ✅" : ""}`;
    playerListEl.appendChild(li);
  }
}

function updateStatusAndTimer() {
  renderPlayerList();

  if (!roundActive) {
    if (roundResult) {
      const movesText = Object.entries(roundResult.moves)
        .map(([id, move]) => `${playerMap.get(id) ?? id} chose ${move}`)
        .join("\n");
      statusEl.textContent = `${roundResult.resultText}\n${movesText}`;
    } else {
      statusEl.textContent = "Waiting for players...";
    }
    timerEl.textContent = "Timer: 0";
    stopCountdown();
    return;
  }

  const elapsedSeconds = Math.floor((Date.now() - roundStartTime) / 1000);
  const remainingSeconds = Math.max(
    0,
    Math.ceil(ROUND_DURATION / 1000) - elapsedSeconds
  );

  timerEl.textContent = `Timer: ${remainingSeconds}`;

  if (remainingSeconds <= 0) {
    stopCountdown();
  } else if (!countdownInterval) {
    startCountdown(remainingSeconds);
  }

  if (moves.has(player.id)) {
    statusEl.textContent = `You chose ${moves.get(
      player.id
    )}. Waiting for others...`;
  } else {
    statusEl.textContent = "Round started! Submit your move within 10 seconds.";
  }
}

function startCountdown(seconds) {
  let remaining = seconds;
  stopCountdown();
  countdownInterval = setInterval(() => {
    remaining--;
    timerEl.textContent = `Timer: ${remaining}`;
    if (remaining <= 0) stopCountdown();
  }, 1000);
}

function stopCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

// Host evaluates round result
function evaluateRound() {
  const entries = Array.from(moves.entries());
  const moveValues = entries.map(([, move]) => move);
  const uniqueMoves = new Set(moveValues);

  let resultText = "";

  if (uniqueMoves.size === 1 || uniqueMoves.size === 3) {
    resultText = "It's a tie!";
  } else {
    const beats = {
      rock: "scissors",
      paper: "rock",
      scissors: "paper",
    };
    const winningMove = [...uniqueMoves].find((move) =>
      [...uniqueMoves].some((m) => beats[move] === m)
    );

    const winners = entries.filter(([, move]) => move === winningMove);
    resultText = `Winner(s): ${winners
      .map(([id]) => playerMap.get(id) ?? id)
      .join(", ")}`;
  }

  return { resultText, moves: Object.fromEntries(moves) };
}

// Host broadcasts full game state to all players EXCEPT self
function broadcastState() {
  const allOtherPlayers = [...playerMap.keys()].filter(
    (id) => id !== player.id
  );
  if (allOtherPlayers.length === 0) return; // no one to broadcast to

  const msg = {
    type: "rps_update",
    to: allOtherPlayers,
    value: {
      roundActive,
      roundStartTime,
      moves: Object.fromEntries(moves),
      roundResult,
    },
  };
  window.parent.postMessage(msg, "*");
}

// Host starts a new round
function startRound() {
  if (!player?.isHost) return;
  if (roundActive) return;

  roundActive = true;
  roundStartTime = Date.now();
  moves.clear();
  roundResult = null;
  updateStatusAndTimer();
  broadcastState();

  if (hostTimerTimeout) clearTimeout(hostTimerTimeout);
  hostTimerTimeout = setTimeout(() => {
    roundActive = false;
    roundResult = evaluateRound();
    updateStatusAndTimer();
    broadcastState();
  }, ROUND_DURATION);
}

// Player submits a move
function submitMove(move) {
  if (player.isHost) {
    if (!roundActive) {
      startRound();
    }
    if (!moves.has(player.id)) {
      moves.set(player.id, move);
      updateStatusAndTimer();
      broadcastState();
    }
  } else if (!roundActive) {
    // Not active: send start request + move to host
    sendPartialUpdate({
      startRequest: true,
      moves: { [player.id]: move },
    });
  } else {
    if (moves.has(player.id)) return; // Already moved
    sendPartialUpdate({ moves: { [player.id]: move } });
  }
}

// Non-host sends partial updates to host
function sendPartialUpdate(update) {
  const msg = {
    type: "rps_update",
    to: [
      playerMap.get(player.id)
        ? [...playerMap.keys()].find((id) => id === player.id)
        : undefined,
    ].filter(Boolean), // send only to host
    value: update,
  };
  window.parent.postMessage(msg, "*");
}

// Handle incoming update messages
function handleUpdate(message) {
  const v = message.value;

  if (player.isHost) {
    // Host receives moves and/or start request from players
    if (v.startRequest && !roundActive) {
      startRound();
    }
    if (v.moves) {
      for (const [id, move] of Object.entries(v.moves)) {
        if (!moves.has(id)) {
          moves.set(id, move);
        }
      }
    }
    updateStatusAndTimer();
    broadcastState();
    return;
  }

  // Non-host updates full state from host
  if (typeof v.roundActive === "boolean") roundActive = v.roundActive;
  if (v.roundStartTime) roundStartTime = v.roundStartTime;
  else if (v.roundActive === false) roundStartTime = null;

  moves = new Map(Object.entries(v.moves || {}));
  roundResult = v.roundResult || null;

  updateStatusAndTimer();

  if (roundActive && !countdownInterval) {
    const elapsed = Math.floor((Date.now() - roundStartTime) / 1000);
    const remaining = Math.max(0, Math.ceil(ROUND_DURATION / 1000) - elapsed);
    if (remaining > 0) startCountdown(remaining);
    else stopCountdown();
  }
}

moveButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    submitMove(btn.dataset.move);
  });
});

window.addEventListener("message", (event) => {
  const message = event.data;

  switch (message.type) {
    case "_player_info":
      player = message.value;
      break;

    case "_player_list":
      playerMap = new Map(message.value);
      updateStatusAndTimer();
      break;

    case "rps_update":
      handleUpdate(message);
      break;
  }
});
