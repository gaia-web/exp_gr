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
  console.log("XXX - renderPlayerHand called, hand:", hand);
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

function updateStatusAndTimer() {
  renderPlayerList();
  renderPlayerHand();

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
  console.log(
    "XXX - updateStatusAndTimer called, currentTurn:",
    currentTurn,
    "player.id:",
    player.id,
    "move:",
    move
  );
  if (
    currentTurn === player.id
    // &&
    // (!move || (move.action !== "stand" && move.action !== "bust"))
  ) {
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
  const eligible = Array.from(hands.entries()).filter(([id, hand]) => {
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
  console.log("XXX - broadcasting staet:", msg);
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
    console.log("XXX - dealing cards to", id);
    // everyone draw 2 cards
    hands.set(id, [deck.pop(), deck.pop()]);
    console.log("XXX - hands are now cards to", hands);
  }
  moves = new Map();
  roundResult = null;
  console.log("YYY - hands are now cards to", hands);
  // First turn: first player in playerMap
  currentTurn = [...playerMap.keys()][0];
  console.log("ZZZ - hands are now cards to", hands);
  updateStatusAndTimer();
  console.log("OOO - hands are now cards to", hands);
  broadcastState();
}

// Player: submit move ("hit" or "stand")
// function submitMove(action) {
//   if (player.isHost) {
//     if (!roundActive) startRound();
//     if (currentTurn !== player.id) return;
//     if (action === "hit") {
//       const hand = hands.get(player.id) || [];
//       hand.push(deck.pop());
//       hands.set(player.id, hand);
//       if (handValue(hand) > 21) {
//         moves.set(player.id, { action: "bust" });
//       }
//     } else if (action === "stand") {
//       moves.set(player.id, { action: "stand" });
//     }
//     // Next turn
//     nextTurnOrEnd();
//     updateStatusAndTimer();
//     broadcastState();
//   } else if (!roundActive) {
//     console.log("not your round, do nothing");
//     // sendPartialUpdate({ startRequest: true, move: action });
//   } else {
//     sendPartialUpdate({ move: action, sender: player.id });
//   }
// }

// Host: advance to next turn or end round
function nextTurnOrEnd() {
  const ids = [...playerMap.keys()];
  console.log("XXX - nextTurnOrEnd called, ids:", ids, "currentTurn", currentTurn);
  let currentIdx = ids.indexOf(currentTurn);
  // Find next player who hasn't stood or busted
  let remainingActionable = 0;
  let foundNext = false;
  for (let i = currentIdx + 1; i < ids.length; i++) {
    // const nextIdx = (idx + i) % ids.length;
    // const id = ids[nextIdx];
    const id = ids[i];
    const move = moves.get(id);
    console.log("XXX - first half checking player", id, "move:", move);
    if (!move || (move.action !== "stand" && move.action !== "bust")) {
      if (!foundNext) {
        currentTurn = id;
        foundNext = true;
      }
      remainingActionable++;
    }
  }

  if (!foundNext) {
    for (let i = 0; i < currentIdx; i++) {
      const id = ids[i];
      const move = moves.get(id);
      console.log("XXX - second half checking player", id, "move:", move);
      if (!move || (move.action !== "stand" && move.action !== "bust")) {
        if (!foundNext) {
          currentTurn = id;
          foundNext = true;
        }
        remainingActionable++;
      }
    }
  }

  // ids.forEach((id) => {
  //   const move = moves.get(id);
  //   if (!move || move.action !== "bust" || move.action !== "stand") {
  //     // currentTurn = id;
  //     remainingActionable++;
  //     // break;
  //   }
  // });
  if (remainingActionable <= 0) {
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
    if (!roundActive) {
      console.log("Round not active, do nothing");
      return;
    }
    if (currentTurn !== playerId) {
      console.log(`Not ${playerId}'s turn, do nothing`);
      return;
    }
    if (action === "hit") {
      console.log(`XXX - ${playerId} hits`);
      const hand = hands.get(playerId) || [];
      hand.push(deck.pop());
      hands.set(playerId, hand);
      if (handValue(hand) > 21) {
        moves.set(playerId, { action: "bust" });
      }
    } else if (action === "stand") {
      console.log(`XXX - ${playerId} stands`);
      // do nothing, skip
    }
    nextTurnOrEnd();
    updateStatusAndTimer();
    // if (roundActive) {
    broadcastState();
    // }
  } else {
    console.log(`XXX - ${playerId} is not host, sending action to host`);
    // Non-host: send action to host
    sendPartialUpdate({ move: action, sender: playerId });
  }
}

// Handle incoming update messages
function handleUpdate(message) {
  console.log("XXX - Received update:", message);
  const v = message.value;

  if (player.isHost) {
    handleActions(v.move, v.sender);

    nextTurnOrEnd();
    broadcastState();

    console.log("hand is now:", hands);
  } else {
    hands = new Map(Object.entries(v.hands || {}));
    roundActive = v.roundActive;
    currentTurn = v.currentTurn || null;
  }
  updateStatusAndTimer();

  console.log("XXX - after handler roudactive is:", roundActive);
  console.log("XXX - after handler currentTurn is:", currentTurn);
}

// Handle incoming update messages
// function handleUpdate(message) {
//   console.log("XXX - Received update:", message);
//   const v = message.value;

//   // host need to handle player actions
//   // first check if the sender is able to take action
//   // for hit, we need to update the hand and check for bust
//   if (player.isHost) {
//     if (v.startRequest && !roundActive) startRound();
//     if (v.move && currentTurn === player.id && roundActive) {
//       submitMove(v.move);
//     }
//     updateStatusAndTimer();
//     broadcastState();
//     return;
//   }
//   // Non-host: update state from host
//   if (typeof v.roundActive === 'boolean') roundActive = v.roundActive;
//   if (typeof v.currentTurn === 'string' || v.currentTurn === null) currentTurn = v.currentTurn;
//   moves = new Map(Object.entries(v.moves || {}));
//   roundResult = v.roundResult || null;
//   if (v.hands && v.hands[player.id]) hands.set(player.id, v.hands[player.id]);
//   updateStatusAndTimer();
// }

const startRoundBtn = document.getElementById("start-round-btn");
const hitBtn = document.getElementById("hit-btn");
const standBtn = document.getElementById("stand-btn");

startRoundBtn.textContent = "Deal";
hitBtn.textContent = "Hit";
standBtn.textContent = "Stand";
startRoundBtn.onclick = () => {
  if (player.isHost && !roundActive) startRound();
};

// hitBtn.onclick = () => submitMove("hit");
hitBtn.onclick = () => handleActions("hit", player.id);
standBtn.onclick = () => handleActions("stand", player.id);
// standBtn.onclick = () => submitMove("stand");

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
