import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import { Header } from "./components/Header/index.js";
import { Home } from "./pages/Home/index.jsx";
import { Lounge } from "./pages/Lounge/index.js";
import { Chatting } from "./pages/Chatting/index.js";
import { IntegrationTest } from "./pages/IntegrationTest/index.js";
import { NotFound } from "./pages/_404.jsx";

import "./style.css";
import "./neumo.css";

export function App() {
  return (
    <LocationProvider>
      <Header />
      <main class="neumo hollow">
        <Router>
          <Route path="/" component={Home} />
          <Route path="/room/:roomName" component={Lounge} />
          <Route path="/room/:roomName/chat" component={Chatting} />
          <Route path="int-test" component={IntegrationTest} />
          <Route default component={NotFound} />
        </Router>
      </main>
    </LocationProvider>
  );
}

render(<App />, document.getElementById("app"));
