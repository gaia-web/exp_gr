import { useSignal, useSignalEffect } from "@preact/signals";
import { useLocation } from "preact-iso";
import { pageTranstionResolver } from "../../utils/view-transition";
import { isHost, peer } from "../../utils/peer";
import { Show, useSignalRef } from "@preact/signals/utils";
import {
  currentGamePluginIframe,
  GameStateMessageType,
  handleMessageFromTheGamePlugin,
  sendMessageToTheGamePlugin,
} from "../../utils/game";
import { hostId, playerMap, playerName } from "../../utils/session";
import "./style.css";

export function Playing() {
  const { route } = useLocation();
  const iframeRef = useSignalRef<HTMLIFrameElement>(null);
  const game = useSignal(""); // TODO this is temp

  useSignalEffect(() => {
    function handleMessage(event: MessageEvent) {
      // TODO Optional: restrict origin for security
      // if (event.origin !== window.origin) return;
      if (iframeRef.current?.contentWindow !== event.source) return;
      handleMessageFromTheGamePlugin(event.data);
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  });

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

  useSignalEffect(() => {
    currentGamePluginIframe.value = iframeRef.current;
    if (!iframeRef.current) {
      console.error("Iframe is not available.");
      return;
    }
    iframeRef.current.addEventListener("load", () => {
      sendMessageToTheGamePlugin({
        type: GameStateMessageType._PLAYER_INFO,
        value: {
          id: peer.value.id,
          name: playerName.value,
          isHost: isHost.value,
        },
      });
      sendMessageToTheGamePlugin({
        type: GameStateMessageType._HOST_PLAYER,
        value: hostId.value,
      });
      sendMessageToTheGamePlugin({
        type: GameStateMessageType._PLAYER_LIST,
        value: [...playerMap.value.entries()],
      });
    });
  });

  return (
    <section class="playing page">
      {game.value ? (
        <iframe class="game-plugin" ref={iframeRef} src={game.value} />
      ) : (
        <div>
          <b>This is a temp selection</b>
          <br />
          <button
            class="neumo"
            onClick={() => {
              game.value = "/games/rock-paper-scissors/index.html";
            }}
          >
            Rock, Paper, and Scissors
          </button>
          <button
            class="neumo"
            onClick={() => {
              game.value = "/games/tic-tac-toe/index.html";
            }}
          >
            Tic Tac Toe
          </button>
        </div>
      )}
    </section>
  );
}
