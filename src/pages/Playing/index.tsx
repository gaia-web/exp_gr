import { useSignalEffect } from "@preact/signals";
import { useLocation } from "preact-iso";
import { isHost, peer } from "../../utils/peer";
import { useSignalRef } from "@preact/signals/utils";
import {
  currentGamePluginIframe,
  GameStateMessageType,
  handleMessageFromTheGamePlugin,
  sendMessageToTheGamePlugin,
} from "../../utils/game";
import { playerMap, playerName } from "../../utils/session";
import "./style.css";

export function Playing() {
  const { route } = useLocation();
  const iframeRef = useSignalRef<HTMLIFrameElement>(null);

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
    if (!peer.value) {
      alert("Connection lost or timed out, exiting room...");
      route("/");
    }
  });

  useSignalEffect(() => {
    currentGamePluginIframe.value = iframeRef.current;
    if (!iframeRef.current) console.error("Iframe is not available.");
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
        type: GameStateMessageType._PLAYER_LIST,
        value: [...playerMap.value.entries()],
      });
    });
  });

  return (
    <section class="playing page">
      <iframe
        class="game-plugin"
        ref={iframeRef}
        src="/rock-paper-scissors/index.html"
      />
    </section>
  );
}
