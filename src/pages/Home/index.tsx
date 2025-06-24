import { useSignal, useSignalEffect } from "@preact/signals";
import "./style.css";
import { useRef } from "preact/hooks";

export function Home() {
  const buttonRef = useRef<HTMLButtonElement>();
  const dialogRef = useRef<HTMLDialogElement>();
  const dialogOpened = useSignal(false);

  useSignalEffect(() => {
    const callback = () => {
      if (!dialogRef.current || !buttonRef.current) return;
      if (dialogOpened.value) {
        buttonRef.current.style.viewTransitionName = null;
        dialogRef.current.style.viewTransitionName = "dialog";
        dialogRef.current.showModal();
        return;
      }
      dialogRef.current.style.viewTransitionName = null;
      buttonRef.current.style.viewTransitionName = "dialog";
      dialogRef.current?.close();
    };
    if (document.startViewTransition) {
      if (dialogOpened.value) {
        buttonRef.current.style.viewTransitionName = "dialog";
      } else {
        dialogRef.current.style.viewTransitionName = "dialog";
      }
      const viewTransition = document.startViewTransition(callback);
      viewTransition.finished.then(() => {
        buttonRef.current.style.viewTransitionName = null;
        dialogRef.current.style.viewTransitionName = null;
      });
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
        ref={buttonRef}
        class="neumo"
        onClick={() => {
          dialogOpened.value = true;
        }}
      >
        Open Modal
      </button>
      <dialog
        ref={dialogRef}
        class="neumo"
        style={{ maxWidth: "50%", aspectRatio: "16 / 9" }}
      >
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente
        aspernatur recusandae perspiciatis reiciendis iusto? Obcaecati error
        excepturi, inventore esse impedit magni eaque ullam natus recusandae
        itaque sapiente alias commodi qui!
        <br />
        <button
          class="neumo"
          onClick={() => {
            dialogOpened.value = false;
          }}
        >
          Close Modal
        </button>
      </dialog>
    </div>
  );
}
