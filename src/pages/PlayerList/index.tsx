import { useSignalEffect } from "@preact/signals";
import { useLocation, useRoute } from "preact-iso";
import { peer } from "../../utils/peer";
import { hostId, playerMap } from "../../utils/session";
import "./style.css";

export function PlayerList() {
  const { route } = useLocation();
  const { params } = useRoute();

  useSignalEffect(() => {
    if (!peer.value) {
      alert("Connection lost or timed out, exiting room...");
      route("/");
    }
  });

  return (
    <section class="player-list page">
      <h1>Room: {params.roomName}</h1>
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
    </section>
  );
}
