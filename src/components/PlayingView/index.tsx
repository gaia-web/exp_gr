import { useSignalEffect } from "@preact/signals";
import { pageTranstionResolver } from "../../utils/view-transition";
import {
  currentGamePluginIframe,
  currentGamePluginSrc,
} from "../../utils/game";
import "./style.css";

export function PlayingView() {
  useSignalEffect(() => {
    pageTranstionResolver.value?.("");
    pageTranstionResolver.value = void 0;
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
