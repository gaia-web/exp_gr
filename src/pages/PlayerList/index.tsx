import { useSignalEffect } from "@preact/signals";
import { useLocation, useRoute } from "preact-iso";
import { peer } from "../../utils/peer";
import {
  hostId,
  playerMap,
  roomName,
  unreadPlayerListChanges,
} from "../../utils/session";
import "./style.css";
import { pageTranstionResolver } from "../../utils/view-transition";

export function PlayerList() {
  const { route } = useLocation();
  const { params } = useRoute();

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

  useSignalEffect(() => {
    if (!unreadPlayerListChanges.value) return;
    unreadPlayerListChanges.value = false;
  });

  return (
    <section class="player-list page">
      <h1>Room: {params.roomName}</h1>
      <button
        class="neumo"
        onClick={() => {
          const url = new URL(
            `/enter/${encodeURIComponent(roomName.value)}`,
            location.origin
          );
          navigator.share({
            title: `Join my game room - ${roomName.value}`,
            text: `Hey, I am inviting you to join my game session here.`,
            url: url.href,
          });
        }}
      >
        Invite
      </button>
      <div class="neumo hollow card">
        <div class="player-count-label">{playerMap.value.size} Player(s)</div>
        <ul>
          {[...playerMap.value].map(([id, name]) => (
            <li
              class={`neumo ${id === hostId.value ? "host" : ""} ${
                id === peer.value.id ? "self" : ""
              }`}
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
