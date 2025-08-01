import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";
import {
  AlertOptions,
  AlertProvider,
  useAlert,
} from "./components/Alert/index.js";

import { Home } from "./pages/Home/index.jsx";
import { NotFound } from "./pages/_404.jsx";
import { Room } from "./pages/Room/index.js";

import "./style.css";

// TODO may be refactored with a more clear flow
export let showAlert: (options: AlertOptions) => Promise<boolean>;

export function App() {
  showAlert = useAlert();

  return (
    <LocationProvider>
      <main class="neumo hollow">
        <Router>
          <Route path="/" component={Home} />
          <Route path="/room/:roomName/*" component={Room} />
          <Route default component={NotFound} />
        </Router>
      </main>
    </LocationProvider>
  );
}

render(
  <AlertProvider>
    <App />
  </AlertProvider>,
  document.getElementById("app")
);
