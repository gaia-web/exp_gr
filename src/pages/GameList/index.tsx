import { useSignalEffect } from "@preact/signals";
import { useLocation, useRoute } from "preact-iso";
import { peer } from "../../utils/peer";

export function GameList() {
  const { route } = useLocation();
  const { params } = useRoute();

  useSignalEffect(() => {
    if (!peer.value) {
      alert("Connection lost or timed out, exiting room...");
      route("/");
    }
  });
  return <section>A game list should be here.</section>;
}
