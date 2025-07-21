import { useLocation } from "preact-iso";

import "./style.css";
import { exitRoom } from "../../utils/session";
import {
  pageTranstionResolver,
  startViewTransition,
} from "../../utils/view-transition";

export function Header() {
  const { url, route } = useLocation();

  const isRootUrl = () => url === "" || url === "/";

  return (
    <header class={`neumo hollow ${isRootUrl() ? "collapsed" : ""}`}>
      <nav>
        <div class="left-group">
          <button
            class="neumo"
            style={{ marginRight: "auto" }}
            onClick={() => {
              (
                document.querySelector("main") as HTMLElement
              ).style.viewTransitionName = "home-page";
              startViewTransition(
                async () => {
                  (
                    document.querySelector("main") as HTMLElement
                  ).style.viewTransitionName = "";
                  route("/");
                  exitRoom();
                  await new Promise((resolve) => {
                    pageTranstionResolver.value = resolve;
                  });
                  (
                    document.querySelector(".page form.card") as HTMLElement
                  ).style.viewTransitionName = "home-page";
                },
                void 0,
                () => {
                  (
                    document.querySelector(".page form.card") as HTMLElement
                  ).style.viewTransitionName = "";
                }
              );
            }}
          >
            Exit
          </button>
          <h1 style={{ marginLeft: "1em" }}>Waiting Room</h1>
        </div>
        <div class="right-group"></div>
      </nav>
    </header>
  );
}
