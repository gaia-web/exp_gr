import { useLocation } from "preact-iso";

import "./style.css";
import { exitRoom } from "../../utils/session";
import {
  pageTranstionResolver,
  startViewTransition,
} from "../../utils/view-transition";
import { LogOut } from "lucide-preact";

export function Header() {
  const { url, route } = useLocation();

  const shouldHideHeader = () =>
    url === "" || url === "/" || /^\/enter\/[^\/]+$/.test(url);

  const pageViewTransitionHandler = (href: string) => {
    if (!href) return;
    (document.querySelector("main") as HTMLElement).style.viewTransitionName =
      "page";
    startViewTransition(
      async () => {
        route(href);
        await new Promise((resolve) => {
          pageTranstionResolver.value = resolve;
        });
      },
      void 0,
      () => {
        (
          document.querySelector("main") as HTMLElement
        ).style.viewTransitionName = "";
      }
    );
  };

  return (
    <header class={`neumo hollow ${shouldHideHeader() ? "collapsed" : ""}`}>
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
            <LogOut />
          </button>
          <h1 style={{ marginLeft: "1em" }}>Waiting Room</h1>
        </div>
        <div class="right-group"></div>
      </nav>
    </header>
  );
}
