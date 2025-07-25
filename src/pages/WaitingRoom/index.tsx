import { Route, Router, useRoute } from "preact-iso";
import { NavigationBar } from "../../components/NavigationBar";
import { PlayerListView } from "../../components/PlayerListView";
import { ChattingView } from "../../components/ChattingView";
import { GameListView } from "../../components/GameListView";
import { PlayingView } from "../../components/PlayingView";
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
import { playerName, playerMap, hostId } from "../../utils/session";

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
    currentGamePluginIframe.value?.contentDocument?.location.reload();
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
    <section class="waiting-room page">
      <div class="content-container">
        <iframe class="game-plugin" ref={iframeRef} />
        <Router>
          <Route path="/players" component={PlayerListView} />
          <Route path="/chat" component={ChattingView} />
          <Route path="/games" component={GameListView} />
          <Route path="/play" component={PlayingView} />
        </Router>
      </div>
      <NavigationBar />
    </section>
  );
}
