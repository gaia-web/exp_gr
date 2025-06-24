import { useSignal, useSignalEffect } from "@preact/signals";
import "./style.css";
import { useRef } from "preact/hooks";

export function Home() {
  const dialogRef = useRef<HTMLDialogElement>();
  const foo = useSignal(false);

  useSignalEffect(() => {
    const shouldOpen = foo.value;
    const callback = () => {
      if (!dialogRef.current) return;
      if (shouldOpen) {
        dialogRef.current.style.viewTransitionName = "dialog";
        dialogRef.current.showModal();
        return;
      }
      dialogRef.current.style.viewTransitionName = "dialog";
      dialogRef.current?.close();
    };
    if (document.startViewTransition) {
      document.startViewTransition(callback);
    } else {
      callback();
    }
  });

  return (
    <div class="home">
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores at,
        doloremque officiis maxime vitae recusandae. Libero et eligendi itaque
        id quia autem, animi ipsa ad architecto, nemo officia soluta officiis.
      </p>
      <button
        class="neumo"
        onClick={() => {
          foo.value = true;
        }}
      >
        Open Modal
      </button>
      <dialog ref={dialogRef} style="background: var(--background-color);">
        Foo
        <br />
        <button
          class="neumo"
          onClick={() => {
            foo.value = false;
          }}
        >
          Close Modal
        </button>
      </dialog>
    </div>
  );
}
