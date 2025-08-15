import { batch, useSignal } from "@preact/signals";
import { useSignalRef } from "@preact/signals/utils";
import { createContext } from "preact";
import { useContext, useEffect } from "preact/hooks";
import WithVibration from "../WithViberation";
import "./style.css";

export type AlertOptions = {
  title?: string;
  content?: string;
  confirmText?: string;
  cancelText?: string;
};

type AlertProps = AlertOptions & {
  visible: boolean;
  onClose: (isConfirmed: boolean) => void;
};

type AlertContextType = {
  showAlert: (options: AlertOptions) => Promise<boolean>;
};

const AlertContext = createContext<AlertContextType | null>(null);

function Alert({
  title,
  content,
  confirmText = "OK",
  cancelText = "Cancel",
  visible,
  onClose,
}: AlertProps) {
  const dialogRef$ = useSignalRef<HTMLDialogElement>(null);

  useEffect(handleVisibleEffect, [visible]);
  useEffect(handleOnCloseEffect, [onClose]);

  return (
    <dialog class="neumo alert" ref={dialogRef$}>
      <b class="dialog-title">{title}</b>
      <p>{content}</p>
      <div class="button-group">
        <WithVibration.Button
          class="neumo confirm"
          onClick={() => {
            onClose?.(true);
          }}
        >
          {confirmText}
        </WithVibration.Button>
        {cancelText && (
          <WithVibration.Button
            class="neumo"
            onClick={() => {
              onClose?.(false);
            }}
          >
            {cancelText}
          </WithVibration.Button>
        )}
      </div>
    </dialog>
  );

  function handleOnCloseEffect() {
    const dialog = dialogRef$.current;
    if (!dialog) return;

    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose?.(false);
    };
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }

  function handleVisibleEffect() {
    if (visible) {
      dialogRef$.current?.showModal();
    } else {
      dialogRef$.current?.close();
    }
  }
}

export function AlertProvider({
  children,
}: {
  children: preact.ComponentChildren;
}) {
  const alertOptions$ = useSignal<AlertOptions | null>(null);
  const visible$ = useSignal(false);

  let resolveRef$ = useSignalRef<(isConfirmed: boolean) => void>(null);

  function showAlert(options: AlertOptions) {
    alertOptions$.value = options;
    visible$.value = true;

    return new Promise<boolean>((resolve) => {
      resolveRef$.current = resolve;
    });
  }

  function closeHandler(isConfirmed: boolean) {
    batch(() => {
      visible$.value = false;
      resolveRef$.current?.(isConfirmed);
      resolveRef$.current = null;
    });
  }

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Alert
        {...alertOptions$.value}
        visible={visible$.value}
        onClose={closeHandler}
      />
    </AlertContext.Provider>
  );
}

export function useAlert(): (options: AlertOptions) => Promise<boolean> {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context.showAlert;
}
