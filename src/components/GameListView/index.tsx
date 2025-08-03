import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import { resolvePageTransitionPromise } from "../../utils/view-transition";
import {
  sendGamePickMessage,
  gamePickMap$,
  hasGamePickPending$,
} from "../../utils/game-pick";
import {
  type GameInfo,
  GameStatus,
  boardcastGameStatus,
  currentGameList$,
  currentGamePluginSrc$,
  isGameActive$,
  hasStartedGamePending$,
} from "../../utils/game";
import { useSignalRef } from "@preact/signals/utils";
import { isHost$ } from "../../utils/peer";
import { githubDarkTheme, githubLightTheme, JsonEditor } from "json-edit-react";
import "./style.css";
import { showAlert } from "../..";

export function GameListView() {
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

  useSignalEffect(resolvePageTransitionPromise);
  useSignalEffect(resetEditingGameList);
  useSignalEffect(resetAttentionStatus);

  return (
    <section class="game-list view">
      {renderConfigView()}
      {renderGameList()}
      {renderGameControl()}
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
            onClick={async () => {
              gameListConfigDialogRef$.current?.close();
              try {
                const data = editingGameList$.value;
                if (!Array.isArray(data)) {
                  await showAlert({
                    content:
                      "The JSON content must be an array of game definitions.",
                  });
                  return;
                }
                currentGameList$.value = data;
              } catch {
                await showAlert({ content: "Fail to parse the JSON." });
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
                  sendGamePickMessage(id);
                }}
              >
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
              </button>
            )
          )}
        </div>
      </>
    );
  }

  function renderGameControl() {
    if (!isHost$.value) return null;
    return isGameActive$.value ? (
      <button
        class="neumo"
        onClick={() => {
          boardcastGameStatus({ type: GameStatus.RETIRED });
          currentGamePluginSrc$.value = "";
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
        <dialog class="neumo start-game-dialog" ref={gameSelectionDialogRef$}>
          <div>
            {polledGameList$.value?.map(
              ({
                id,
                label,
                description,
                playerLimit,
                pluginUrl,
                pollCount,
              }) => (
                <button
                  class="neumo"
                  onClick={() => {
                    boardcastGameStatus({ type: GameStatus.READY, value: id });
                    currentGamePluginSrc$.value = pluginUrl;
                    hasStartedGamePending$.value = true;
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
          </div>
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

  function resetAttentionStatus() {
    if (!hasGamePickPending$.value) return;
    hasGamePickPending$.value = false;
  }
}
