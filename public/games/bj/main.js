// --- Multiplayer 21 Points (Blackjack, host authoritative, no timers) ---
const suits = ["♠", "♥", "♦", "♣"];
const ranks = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

const statusEl = document.getElementById("status");
const playerHandEl = document.getElementById("player-hand");

let player = null; // { id, name, isHost }
let playerMap = new Map();

// Host-authoritative round state
let roundActive = false;
let deck = [];
let hands = new Map(); // id -> [card, card, ...]
let moves = new Map(); // id -> {action: 'stand'|'bust'}
let roundResult = null;
let currentTurn = null; // id of player whose turn it is

function createDeck() {
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function cardToString(card) {
  return `${card.rank}${card.suit}`;
}

function renderCards(container, cards) {
  container.innerHTML = "";
  for (const card of cards) {
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = cardToString(card);
    container.appendChild(div);
  }
}

function renderPlayerHand() {
  // Only show this player's hand
  const hand = hands.get(player.id) || [];
  renderCards(playerHandEl, hand);
  // Show hand value
  const value = handValue(hand);
  playerHandEl.insertAdjacentHTML(
    "beforeend",
    `<div style="margin-left:10px;align-self:center;">(${value})</div>`
  );
}

function renderPlayerList() {
  // Show all players and their hand value/status
  let list = "";
  for (const [id, name] of playerMap.entries()) {
    const hand = hands.get(id) || [];
    const move = moves.get(id);
    let status = "";
    if (move) {
      if (move.action === "stand") status = " 🟢";
      if (move.action === "bust") status = " ❌";
    } else if (id === currentTurn) {
      status = " ⏳";
    }
    list += `${name} (${handValue(hand)})${status}<br>`;
  }
  statusEl.innerHTML = list;
}

function setStatus(msg) {
  statusEl.innerHTML = msg;
}

function disableControls() {
  const hitBtn = document.getElementById("hit-btn");
  const standBtn = document.getElementById("stand-btn");
  if (hitBtn instanceof HTMLButtonElement) hitBtn.disabled = true;
  if (standBtn instanceof HTMLButtonElement) standBtn.disabled = true;
}

function enableControls() {
  const hitBtn = document.getElementById("hit-btn");
  const standBtn = document.getElementById("stand-btn");
  if (hitBtn instanceof HTMLButtonElement) hitBtn.disabled = false;
  if (standBtn instanceof HTMLButtonElement) standBtn.disabled = false;
}

function renderAllHands() {
  const handsContainer = document.getElementById("all-hands");
  if (!handsContainer) return;
  handsContainer.innerHTML = "";
  for (const [id, name] of playerMap.entries()) {
    const hand = hands.get(id) || [];
    const move = moves.get(id);
    const handDiv = document.createElement("div");
    handDiv.className = "all-hands";
    let label = name;
    if (move && move.action === "stand") label += " 🟢";
    if (move && move.action === "bust") label += " ❌";
    if (id === currentTurn) label += " ⏳";
    const labelDiv = document.createElement("div");
    labelDiv.textContent = label;
    labelDiv.style.minWidth = "100px";
    handDiv.appendChild(labelDiv);
    // Show cards: show all if round over, or if it's you, else facedown
    const showCards = !roundActive || id === player.id;
    for (let i = 0; i < hand.length; i++) {
      const cardDiv = document.createElement("div");
      cardDiv.className = "card";
      if (showCards) {
        cardDiv.textContent = cardToString(hand[i]);
      } else {
        cardDiv.textContent = "🂠";
      }
      handDiv.appendChild(cardDiv);
    }
    // Show hand value if visible
    if (showCards) {
      const valueDiv = document.createElement("div");
      valueDiv.style.marginLeft = "10px";
      valueDiv.textContent = `(${handValue(hand)})`;
      handDiv.appendChild(valueDiv);
    }
    handsContainer.appendChild(handDiv);
  }
}

function updateStatusAndTimer() {
  renderPlayerList();
  renderPlayerHand();
  renderAllHands();

  // Update deal button state
  if (
    typeof startRoundBtn !== "undefined" &&
    startRoundBtn instanceof HTMLButtonElement
  ) {
    startRoundBtn.disabled = roundActive || !player?.isHost;
  }

  if (!roundActive) {
    if (roundResult) {
      setStatus(roundResult.resultText);
    } else {
      setStatus("Waiting for players...");
    }
    disableControls();
    return;
  }

  // Only allow action if it's this player's turn and not already stood/bust
  const move = moves.get(player.id);

  if (currentTurn === player.id) {
    setStatus("Your turn! Hit or Stand.");
    enableControls();
  } else if (move && move.action === "stand") {
    setStatus("You stood. Waiting for others...");
    disableControls();
  } else if (move && move.action === "bust") {
    setStatus("You busted!");
    disableControls();
  } else {
    setStatus("Waiting for your turn...");
    disableControls();
  }
}

// Host: evaluate round result for 21 points
function evaluateRound() {
  // Only players who did not bust
  const eligible = Array.from(hands.entries()).filter(([id]) => {
    const move = moves.get(id);
    if (!move) return true;
    return move.action !== "bust";
  });
  if (eligible.length === 0) {
    return { resultText: "All players busted. No winner." };
  }
  // Find best hand <= 21
  let best = -1,
    winners = [];
  for (const [id, hand] of eligible) {
    const value = handValue(hand);
    if (value > best && value <= 21) {
      best = value;
      winners = [id];
    } else if (value === best) {
      winners.push(id);
    }
  }
  if (winners.length === 0)
    return { resultText: "All players busted. No winner." };
  const winnerNames = winners.map((id) => playerMap.get(id) || id).join(", ");
  return { resultText: `Winner(s): ${winnerNames} with ${best} points!` };
}

// Host: broadcast state to all other players
function broadcastState() {
  const allOtherPlayers = [...playerMap.keys()].filter(
    (id) => id !== player.id
  );
  if (allOtherPlayers.length === 0) return;
  const msg = {
    type: "twentyone_update",
    to: allOtherPlayers,
    value: {
      roundActive,
      currentTurn,
      moves: Object.fromEntries(moves),
      roundResult,
      hands: Object.fromEntries(hands), // only send own hand
    },
  };
  window.parent.postMessage(msg, "*");
}

// Host: start new round
function startRound() {
  if (!player?.isHost) return;
  if (roundActive) return;
  roundActive = true;
  deck = createDeck();
  shuffle(deck);
  hands = new Map();
  for (const id of playerMap.keys()) {
    // everyone draw 2 cards
    hands.set(id, [deck.pop(), deck.pop()]);
  }
  moves = new Map();
  roundResult = null;
  currentTurn = [...playerMap.keys()][0];
  updateStatusAndTimer();
  broadcastState();
}

function nextTurnOrEnd() {
  let standCount = 0;
  let bustCount = 0;

  const ids = [...playerMap.keys()];

  ids.forEach((id) => {
    const move = moves.get(id);
    if (!move) {
      // do nothing and skip
    } else if (move.action === "stand") {
      standCount++;
    } else if (move.action === "bust") {
      bustCount++;
    }
  });

  if (standCount + bustCount == ids.length) {
    // All done
    roundActive = false;
    roundResult = evaluateRound();
    currentTurn = null;
    return;
  }

  let currentIdx = ids.indexOf(currentTurn);
  // Find next player who hasn't stood or busted
  let remainingActionable = 0;
  let foundNext = false;
  for (let i = currentIdx + 1; i < ids.length; i++) {
    const id = ids[i];
    const move = moves.get(id);
    if (!move || (move.action !== "stand" && move.action !== "bust")) {
      if (!foundNext) {
        currentTurn = id;
        foundNext = true;
      }
      remainingActionable++;
    }
  }

  if (!foundNext) {
    for (let i = 0; i <= currentIdx; i++) {
      const id = ids[i];
      const move = moves.get(id);
      if (!move || (move.action !== "stand" && move.action !== "bust")) {
        if (!foundNext) {
          currentTurn = id;
          foundNext = true;
        }
        remainingActionable++;
      }
    }
  }

  if (remainingActionable <= 0 || bustCount === ids.length - 1) {
    // All done
    roundActive = false;
    roundResult = evaluateRound();
    currentTurn = null;
  }
}

// Non-host: send partial update to host
function sendPartialUpdate(update) {
  const msg = {
    type: "twentyone_update",
    value: update,
  };
  window.parent.postMessage(msg, "*");
}

function handleActions(action, playerId) {
  // host needs to handle calculation and update game state.
  if (player.isHost) {
    // Round not active, ignore action
    if (!roundActive) {
      return;
    }
    // Not this player's turn, skip action
    if (currentTurn !== playerId) {
      return;
    }
    if (action === "hit") {
      const hand = hands.get(playerId) || [];
      hand.push(deck.pop());
      hands.set(playerId, hand);
      if (handValue(hand) > 21) {
        moves.set(playerId, { action: "bust" });
      }
    } else if (action === "stand") {
      moves.set(playerId, { action: "stand" });
      // do nothing, skip
    }
    nextTurnOrEnd();
    updateStatusAndTimer();
    broadcastState();
  } else {
    // Non-host: send action to host
    sendPartialUpdate({ move: action, sender: playerId });
  }
}

// Handle incoming update messages
function handleUpdate(message) {
  const v = message.value;

  if (player.isHost) {
    handleActions(v.move, v.sender);
  } else {
    hands = new Map(Object.entries(v.hands || {}));
    roundActive = v.roundActive;
    currentTurn = v.currentTurn || null;
    roundResult = v.roundResult || null;
    moves = new Map(Object.entries(v.moves || {}));
  }
  updateStatusAndTimer();
}

const startRoundBtn = document.getElementById("start-round-btn");
const hitBtn = document.getElementById("hit-btn");
const standBtn = document.getElementById("stand-btn");

startRoundBtn.textContent = "Start Round";
hitBtn.textContent = "Hit";
standBtn.textContent = "Stand";
startRoundBtn.onclick = () => {
  if (player.isHost && !roundActive) startRound();
};

hitBtn.onclick = () => handleActions("hit", player.id);
standBtn.onclick = () => handleActions("stand", player.id);

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
    case "twentyone_update":
      handleUpdate(message);
      break;
  }
});

// Calculate blackjack hand value
function handValue(hand) {
  let value = 0,
    aces = 0;
  for (const card of hand) {
    if (card.rank === "A") {
      value += 11;
      aces++;
    } else if (["K", "Q", "J"].includes(card.rank)) {
      value += 10;
    } else {
      value += parseInt(card.rank, 10);
    }
  }
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  return value;
}
