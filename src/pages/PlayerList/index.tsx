import { useSignalEffect } from "@preact/signals";
import { useLocation, useRoute } from "preact-iso";
import { peer } from "../../utils/peer";
import { hostId, playerMap, unreadPlayerListChanges } from "../../utils/session";
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

  useSignalEffect(() => {
    if (!unreadPlayerListChanges.value) return;
    unreadPlayerListChanges.value = false;
  });

  return (
    <section class="player-list page">
      <h1>Room: {params.roomName}</h1>
      <div class="neumo hollow card">
        <div class="player-count-label">{playerMap.value.size} Player(s)</div>
        <ul>
          {[...playerMap.value].map(([id, playerState]) => (
            <li
              class={`neumo ${id === hostId.value ? "host" : ""} ${
                id === peer.value.id ? "self" : ""
              }`}
            >
              {playerState.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
