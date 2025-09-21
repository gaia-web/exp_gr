import { useSignalEffect } from "@preact/signals";
import { useRoute } from "preact-iso";
import { peer$ } from "../../utils/peer";
import {
  hostId$,
  playerMap$,
  roomName$,
  unreadPlayerListChanges$,
} from "../../utils/session";
import "./style.css";
import { resolvePageTransitionPromise } from "../../utils/view-transition";
import WithVibration from "../WithViberation";

export function PlayerListView() {
  const { params } = useRoute();

  useSignalEffect(resolvePageTransitionPromise);
  useSignalEffect(resetAttentionStatus);

  return (
    <section class="player-list view">
      <h1>Room: {params.roomName}</h1>
      <WithVibration.Button
        class="neumo"
        onClick={() => {
          const url = new URL(
            `/enter/${encodeURIComponent(roomName$.value)}`,
            location.origin
          );
          navigator.share({
            title: `Join my game room - ${roomName$.value}`,
            text: `Hey, I am inviting you to join my game session here.`,
            url: url.href,
          });
        }}
      >
        Invite
      </WithVibration.Button>
      <div class="neumo hollow card">
        <div class="player-count-label">{playerMap$.value.size} Player(s)</div>
        <ul>
          {[...playerMap$.value].map(([id, name]) => (
            <li
              class={`neumo ${id === hostId$.value ? "host" : ""} ${
                id === peer$.value.id ? "self" : ""
              }`}
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );

  function resetAttentionStatus() {
    if (!unreadPlayerListChanges$.value) return;
    unreadPlayerListChanges$.value = false;
  }
}
