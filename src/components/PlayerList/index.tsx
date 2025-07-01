import { hostId, playerMap } from "../../utils/session";

import "./style.css";

export function PlayerList() {
  return (
    <div class="player-list">
      <ul class="neumo hollow">
        <div style={{ fontSize: "1.5em", fontWeight: "bold", margin: "0.5em" }}>
          {playerMap.value.size} Player(s)
        </div>
        {[...playerMap.value].map(([id, name]) => (
          <li
            class={`neumo hollow`}
            style={{
              fontWeight: id === hostId.value ? "bold" : "",
              "--neumo-item-distance": id === hostId.value ? "5px" : "3px",
            }}
          >
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
