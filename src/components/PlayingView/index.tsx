import { useSignalEffect } from "@preact/signals";
import { pageTranstionResolver$ } from "../../utils/view-transition";
import {
  currentGamePluginIframe$,
  isGameActive$,
  hasStartedGamePending$,
} from "../../utils/game";
import "./style.css";

export function PlayingView() {
  useSignalEffect(() => {
    pageTranstionResolver$.value?.("");
    pageTranstionResolver$.value = void 0;
  });

  useSignalEffect(() => {
    if (!hasStartedGamePending$) return;
    hasStartedGamePending$.value = false;
  });

  useSignalEffect(() => {
    if (!currentGamePluginIframe$.value) {
      console.error("Iframe is not available.");
      return;
    }

    currentGamePluginIframe$.value.style.visibility = isGameActive$.value
      ? "visible"
      : "hidden";
    return () => {
      currentGamePluginIframe$.value.style.visibility = "hidden";
    };
  });

  return (
    <section class="playing view">
      {isGameActive$.value ? null : "No game is selected yet."}
    </section>
  );
}
