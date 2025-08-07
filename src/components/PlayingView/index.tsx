import { useSignalEffect } from "@preact/signals";
import { resolvePageTransitionPromise } from "../../utils/view-transition";
import {
  currentGamePluginIframe$,
  isGameActive$,
  hasStartedGamePending$,
} from "../../utils/game";
import "./style.css";

export function PlayingView() {
  useSignalEffect(resolvePageTransitionPromise);
  useSignalEffect(resetAttentionStatus);

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

  function resetAttentionStatus() {
    if (!hasStartedGamePending$) return;
    hasStartedGamePending$.value = false;
  }
}
