import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import { Home } from "./pages/Home/index.jsx";
import { NotFound } from "./pages/_404.jsx";
import { WaitingRoom } from "./pages/WaitingRoom/index.js";

import "./style.css";

export function App() {
  return (
    <LocationProvider>
      <main class="neumo hollow">
        <Router>
          <Route path="/" component={Home} />
          <Route path="/room/:roomName/*" component={WaitingRoom} />
          <Route default component={NotFound} />
        </Router>
      </main>
    </LocationProvider>
  );
}

render(<App />, document.getElementById("app"));
