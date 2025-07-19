import { useSignalEffect } from "@preact/signals";
import { useLocation, useRoute } from "preact-iso";
import { peer } from "../../utils/peer";
import { pageTranstionResolver } from "../../utils/view-transition";

export function GameList() {
  const { route } = useLocation();
  const { params } = useRoute();

  useSignalEffect(() => {
    pageTranstionResolver.value?.("");
    pageTranstionResolver.value = void 0;
  });

  useSignalEffect(() => {
    if (!peer.value) {
      alert("Connection lost or timed out, exiting room...");
      route("/");
    }
  });
  return <section class="game-list page">A game list should be here.</section>;
}
