import { useSignal, useSignalEffect } from "@preact/signals";
import { useLocation } from "preact-iso";
import { peer } from "../../utils/peer";
import { useSignalRef } from "@preact/signals/utils";
import { handleMessageFromTheGameIframe } from "../../utils/game";

export function Playing() {
  const { route } = useLocation();
  const iframeRef = useSignalRef<HTMLIFrameElement>(null);

  useSignalEffect(() => {
    function handleMessage(event: MessageEvent) {
      // TODO Optional: restrict origin for security
      // if (event.origin !== window.origin) return;
      if (iframeRef.current?.contentWindow !== event.source) return;
      handleMessageFromTheGameIframe(event.data);
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
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
          Send Message to the Plugin
        </button>
      </div>
    </section>
  );

  function sendMessage() {
    const message = {
      type: "test",
      value: prompt("Enter message to send to parent:"),
    };
    (iframeRef?.current as HTMLIFrameElement)?.contentWindow?.postMessage(
      message ?? "",
      "*"
    );
  }
}
