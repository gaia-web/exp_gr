import { useSignal, useSignalEffect } from "@preact/signals";
import { useLocation } from "preact-iso";
import { useEffect, useRef } from "preact/hooks";
import { peer } from "../../utils/peer";
import { pageTranstionResolver } from "../../utils/view-transition";

export function Playing() {
  const { route } = useLocation();
  const iframeRef = useRef();
  const messages = useSignal<string[]>([]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Optional: restrict origin for security
      if (event.origin !== window.origin) return;

      if (typeof event.data === "string") {
        messages.value = [...messages.value, event.data];
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useSignalEffect(() => {
    pageTranstionResolver.value?.("");
    pageTranstionResolver.value = void 0;
  });

  useSignalEffect(() => {
    if (!peer.value) {
      alert("Connection lost or timed out, exiting room...");
      route("/");
    }
  });

  return (
    <section class="playing page">
      <iframe ref={iframeRef} src="/test.html" />
      <div>
        <button class="neumo" onClick={sendMessage}>
          Send Message
        </button>
        <ul>
          {messages.value.map((msg) => (
            <li>{msg}</li>
          ))}
        </ul>
      </div>
    </section>
  );

  function sendMessage() {
    const message = prompt("Enter message here to send");
    (iframeRef?.current as HTMLIFrameElement)?.contentWindow?.postMessage(
      message ?? "",
      "*"
    );
  }
}
