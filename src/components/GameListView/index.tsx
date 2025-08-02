import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import { useLocation } from "preact-iso";
import { pageTranstionResolver$ } from "../../utils/view-transition";
import { sendGamePick, gamePickMap$ } from "../../utils/game-pick";
import { useEffect } from "preact/hooks";
import {
  DEFAULT_GAME_LIST,
  type GameInfo,
  GameStatus,
  boardcastGameStatus,
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
  const gameSelectionDialogRef$ = useSignalRef<HTMLDialogElement>(null);
  const editingGameList$ = useSignal<GameInfo[]>([]);
  const polledGameList$ = useComputed(() =>
    currentGameList$.value
      .map((gameInfo) => ({
        ...gameInfo,
        pollCount:
          [...gamePickMap$.value].filter(
            ([_, gameId]) => gameId === gameInfo.id
          ).length ?? 0,
      }))
      .sort((a, b) => b.pollCount - a.pollCount)
  );

  useEffect(() => {
    sendGamePick(null);
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
      {renderConfigView()}
      {renderGameList()}
      {renderGameControl()}
      {/* <div
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
      </div> */}
    </section>
  );

  function renderConfigView() {
    if (!isHost$.value) return null;
    return (
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
    );
  }

  function renderGameList() {
    return (
      <>
        <h2>Vote a Game</h2>
        <div class="game-list neumo hollow">
          {currentGameList$.value?.map(
            ({ id, label, description, playerLimit }) => (
              <button
                class="neumo"
                onClick={() => {
                  // TODO use game id instead of index
                  sendGamePick(id);
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
                  <div class="player-name-list">
                    {[...gamePickMap$.value]
                      .filter(([_, playerState]) => playerState === id)
                      .map(([name, _]) => (
                        <span class="neumo hollow player-name">{name}</span>
                      ))}
                  </div>
                </div>
              </button>
            )
          )}
        </div>
      </>
    );
  }

  function renderGameControl() {
    if (!isHost$.value) return null;
    return currentGamePluginSrc$.value ? (
      <button
        class="neumo"
        onClick={() => {
          boardcastGameStatus({ type: GameStatus.RETIRED });
          currentGamePluginSrc$.value = null;
        }}
      >
        End Game
      </button>
    ) : (
      <>
        <button
          class="neumo"
          onClick={() => {
            gameSelectionDialogRef$.current?.showModal();
          }}
        >
          Start Game
        </button>
        <dialog ref={gameSelectionDialogRef$}>
          {polledGameList$.value?.map(
            ({ id, label, description, playerLimit, pluginUrl, pollCount }) => (
              <button
                class="neumo"
                onClick={() => {
                  boardcastGameStatus({ type: GameStatus.READY, value: id });
                  currentGamePluginSrc$.value = pluginUrl;
                  if (confirm("A game is started, go to the playing page?")) {
                    route(
                      `/room/${encodeURIComponent(roomName$.value)}/play`,
                      true
                    );
                  }
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
                  <br />
                  <span>
                    <b>{pollCount}</b> vote(s)
                  </span>
                </div>
              </button>
            )
          )}
          <br />
          <button
            class="neumo cancel"
            onClick={() => {
              gameSelectionDialogRef$.current?.close();
            }}
          >
            Cancel
          </button>
        </dialog>
      </>
    );
  }

  function resetEditingGameList() {
    editingGameList$.value = currentGameList$.value;
  }
}
