import { useSignal, useSignalEffect } from "@preact/signals";
import { useLocation } from "preact-iso";
import { pageTranstionResolver$ } from "../../utils/view-transition";
import { sendGamePick, gamePickMap$ } from "../../utils/game-pick";
import { useEffect } from "preact/hooks";
import {
  DEFAULT_GAME_LIST,
  type GameInfo,
  currentGameList$,
  currentGamePluginSrc$,
} from "../../utils/game";
import { roomName$ } from "../../utils/session";
import { useSignalRef } from "@preact/signals/utils";
import { isHost$ } from "../../utils/peer";
import { githubDarkTheme, githubLightTheme, JsonEditor } from "json-edit-react";
import "./style.css";

export function GameListView() {
  const { route } = useLocation();
  const gameListConfigDialogRef$ = useSignalRef<HTMLDialogElement>(null);
  const editingGameList$ = useSignal<GameInfo[]>([]);

  useEffect(() => {
    sendGamePick(-1);
  }, []);

  useSignalEffect(() => {
    resetEditingGameList();
  });

  useSignalEffect(() => {
    pageTranstionResolver$.value?.("");
    pageTranstionResolver$.value = void 0;
  });

  return (
    <section class="game-list view">
      {isHost$.value && (
        <div class="config">
          <button
            class="neumo"
            onClick={() => {
              gameListConfigDialogRef$.current?.showModal();
            }}
          >
            Config the list
          </button>
          {/* TODO update it to a user-friendly UI/UX */}
          <dialog class="neumo config-dialog" ref={gameListConfigDialogRef$}>
            <div class="json-editor-scroll-wrapper">
              <JsonEditor
                data={editingGameList$.value}
                setData={(d: GameInfo[]) => {
                  editingGameList$.value = d;
                }}
                theme={
                  window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? githubDarkTheme
                    : githubLightTheme
                }
              />
            </div>
            <button
              class="neumo confirm"
              onClick={() => {
                gameListConfigDialogRef$.current?.close();
                try {
                  const data = editingGameList$.value;
                  if (!Array.isArray(data)) {
                    alert(
                      "The JSON content must be an array of game definitions."
                    );
                    return;
                  }
                  currentGameList$.value = data;
                } catch {
                  alert("Fail to parse the JSON.");
                }
              }}
            >
              Save
            </button>
            <button
              class="neumo cancel"
              onClick={() => {
                gameListConfigDialogRef$.current?.close();
                resetEditingGameList();
              }}
            >
              Cancel
            </button>
          </dialog>
        </div>
      )}
      <h2>Select a Game</h2>
      <div class="game-options">
        {currentGameList$.value?.map((game, index) => (
          <div
            class="neumo hollow card"
            onClick={() => {
              sendGamePick(index);
            }}
          >
            <p>
              {game.label}:
              {[...gamePickMap$.value]
                .filter(([_, playerState]) => playerState === index)
                .map(([name, _]) => name)
                .join(", ")}
            </p>
          </div>
        ))}
      </div>
      <div
        class="neumo hollow"
        style={{ "--neumo-item-background-color": "hsl(0, 50%, 50%)" }}
      >
        <b>This is a temp selection</b>
        <br />
        {DEFAULT_GAME_LIST.map(
          ({ label, description, playerLimit, pluginUrl }) => (
            <button
              class="neumo"
              onClick={() => {
                currentGamePluginSrc$.value = pluginUrl;
                route(
                  `/room/${encodeURIComponent(roomName$.value)}/play`,
                  true
                );
              }}
            >
              <div>
                <b>{label}</b>
                &nbsp;
                <i>
                  ({playerLimit[0] ?? "N/A"} - {playerLimit[1] ?? "N/A"})
                </i>
                <br />
                <span>{description}</span>
              </div>
            </button>
          )
        )}
      </div>
    </section>
  );

  function resetEditingGameList() {
    editingGameList$.value = currentGameList$.value;
  }
}
