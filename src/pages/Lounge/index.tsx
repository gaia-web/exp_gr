import { useSignalEffect } from "@preact/signals";
import { useLocation, useRoute } from "preact-iso";
import { peer } from "../../utils/peer";
import { PlayerList } from "../../components/PlayerList";

export function Lounge() {
  const { route } = useLocation();
  const { params } = useRoute();

  useSignalEffect(() => {
    if (!peer.value) {
      alert("Connection lost or timed out, exiting room...");
      route("/");
    }
  });

  return (
    <div class="waiting-room">
      <h1>Room: {params.roomName}</h1>
      <PlayerList />
    </div>
  );
}
