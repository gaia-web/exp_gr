import { useSignalEffect } from "@preact/signals";
import { useLocation } from "preact-iso";
import { pageTranstionResolver } from "../../utils/view-transition";
import { peer } from "../../utils/peer";
import {
  currentGamePluginIframe,
  currentGamePluginSrc,
} from "../../utils/game";
import "./style.css";

export function PlayingView() {
  const { route } = useLocation();

  useSignalEffect(() => {
    pageTranstionResolver.value?.("");
    pageTranstionResolver.value = void 0;
  });

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
    if (!currentGamePluginIframe.value) {
      console.error("Iframe is not available.");
      return;
    }

    currentGamePluginIframe.value.style.visibility = currentGamePluginSrc.value
      ? "visible"
      : "hidden";
    return () => {
      currentGamePluginIframe.value.style.visibility = "hidden";
    };
  });

  return (
    <section class="playing view">
      {currentGamePluginSrc.value ? null : "No game is selected yet."}
    </section>
  );
}
