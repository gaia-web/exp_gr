import { useLocation } from "preact-iso";

import "./style.css";

export function Header() {
  const { url } = useLocation();

  const isRootUrl = () => url === "" || url === "/";

  return (
    <header class={`neumo hollow ${isRootUrl() ? "collapsed" : ""}`}>
      <nav>
        <a
          href="/"
          class={`neumo ${url === "/" ? "active hollow" : ""}`}
          style={{ marginRight: "auto" }}
        >
          Exit Room
        </a>
        <a
          href="/peer-test"
          class={`neumo ${url === "/peer-test" ? "active hollow" : ""}`}
        >
          Peer Test
        </a>
        <a
          href="/int-test"
          class={`neumo ${url === "/int-test" ? "active hollow" : ""}`}
        >
          Integration Test
        </a>
        <a href="/404" class={`neumo ${url === "/404" ? "active hollow" : ""}`}>
          404
        </a>
      </nav>
    </header>
  );
}
