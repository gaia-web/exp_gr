import { Route, Router, useRoute } from "preact-iso";
import { BottomNavigationBar } from "../../components/BottomNavigationBar";
import { PlayerList } from "../PlayerList";
import { Chatting } from "../Chatting";
import { GameList } from "../GameList";
import { Playing } from "../Playing";
import "./style.css";
import { useSignalRef } from "@preact/signals/utils";
import { useSignalEffect } from "@preact/signals";
import {
  currentGamePluginIframe,
  sendMessageToTheGamePlugin,
  GameStateMessageType,
  handleMessageFromTheGamePlugin,
} from "../../utils/game";
import { peer, isHost } from "../../utils/peer";
import { playerName, playerMap } from "../../utils/session";

export function WaitingRoom() {
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

  // TODO this is a temp solution
  useSignalEffect(() => {
    if (!playerMap.value) {
      return;
    }
    currentGamePluginIframe.value?.contentDocument.location.reload();
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
        type: GameStateMessageType._PLAYER_LIST,
        value: [...playerMap.value.entries()],
      });
    });
  });

  return (
    <section class="waiting-room page">
      <div class="content-container">
        <iframe class="game-plugin" ref={iframeRef} />
        <Router>
          <Route path="/players" component={PlayerList} />
          <Route path="/chat" component={Chatting} />
          <Route path="/games" component={GameList} />
          <Route path="/play" component={Playing} />
        </Router>
      </div>
      <BottomNavigationBar />
    </section>
  );
}
