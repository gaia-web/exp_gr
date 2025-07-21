import { Route, Router } from "preact-iso";
import { BottomNavigationBar } from "../../components/BottomNavigationBar";
import { PlayerList } from "../PlayerList";
import { Chatting } from "../Chatting";
import { GameList } from "../GameList";
import { Playing } from "../Playing";
import "./style.css";

export function WaitingRoom() {
  return (
    <section class="waiting-room page">
      <div class="content-container">
        <Router>
          <Route path="/players" component={PlayerList} />
          <Route path="/chat" component={Chatting} />
          <Route path="/games" component={GameList} />
          <Route path="/play" component={Playing} />
        </Router>
      </div>
      <BottomNavigationBar />
    </section>
  );
}
