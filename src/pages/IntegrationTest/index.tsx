import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";

export function IntegrationTest() {
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

  return (
    <div class="integration-test">
      <iframe ref={iframeRef} src="test.html" />
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
    </div>
  );

  function sendMessage() {
    const message = prompt("Enter message here to send");
    (iframeRef?.current as HTMLIFrameElement)?.contentWindow?.postMessage(
      message ?? "",
      "*"
    );
  }
}
