import { useLocation } from "preact-iso";

export function Header() {
  const { url } = useLocation();

  return (
    <header class="neumo hollow">
      <nav>
        <a href="/" class={`neumo ${url === "/" ? "active hollow" : ""}`}>
          Home
        </a>
        <a href="/404" class={`neumo ${url === "/404" ? "active hollow" : ""}`}>
          404
        </a>
      </nav>
    </header>
  );
}
