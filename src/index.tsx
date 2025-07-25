import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import { Header } from "./components/Header/index.js";
import { Home } from "./pages/Home/index.jsx";
import { PlayerList } from "./pages/PlayerList/index.js";
import { Chatting } from "./pages/Chatting/index.js";
import { GameList } from "./pages/GameList/index.js";
import { Playing } from "./pages/Playing/index.js";
import { NotFound } from "./pages/_404.jsx";

import "./style.css";

export function App() {
  return (
    <LocationProvider>
      <Header />
      <main class="neumo hollow">
        <Router>
          <Route path="/" component={Home} />
          <Route path="/enter/:roomName" component={Home} />
          <Route path="/room/:roomName/players" component={PlayerList} />
          <Route path="/room/:roomName/chat" component={Chatting} />
          <Route path="/room/:roomName/games" component={GameList} />
          <Route path="/room/:roomName/play" component={Playing} />
          <Route default component={NotFound} />
        </Router>
      </main>
    </LocationProvider>
  );
}

render(<App />, document.getElementById("app"));
