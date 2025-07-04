import { useSignalEffect } from "@preact/signals";
import { useLocation, useRoute } from "preact-iso";
import { peer } from "../../utils/peer";
import "./style.css";

export function Chatting() {
  const { route } = useLocation();

  useSignalEffect(() => {
    if (!peer.value) {
      alert("Connection lost or timed out, exiting room...");
      route("/");
    }
  });

  return (
    <div class="chatting">
      <div class="neumo hollow message-container">
        <div style={{ fontSize: "1.5em" }}>Messages</div>
        <ul class="message-list">
          {Array(30)
            .fill(true)
            .map(() => (
              <li class="message-item neumo">
                <div class="message-item-player-label neumo hollow">
                  Someone
                </div>
                <div>
                  Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                  Aperiam obcaecati impedit quod odit provident ipsum fugit
                  dicta possimus nisi sed, inventore nostrum mollitia sit illum
                  aliquid, facilis laborum. Ab, deserunt?
                </div>
              </li>
            ))}
        </ul>
      </div>
      <div class="input-section">
        <textarea class="neumo" />
        <button class="neumo">Send</button>
      </div>
    </div>
  );
}
