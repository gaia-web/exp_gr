import { signal } from "@preact/signals";

export const pageTranstionResolver$ = signal<(s: string) => void>(null);

export async function startViewTransition(
  callback: () => void | Promise<void>,
  readyCallback?: () => void | Promise<void>,
  finishedCallback?: () => void | Promise<void>
) {
  if (!document.startViewTransition) {
    Promise.resolve(callback()).then(() => {
      if (readyCallback) Promise.resolve(readyCallback());
      if (finishedCallback) Promise.resolve(finishedCallback());
    });
    return;
  }

  const transition = document.startViewTransition(callback);
  transition.ready.then(() => {
    if (readyCallback) Promise.resolve(readyCallback());
  });
  transition.finished.then(() => {
    if (finishedCallback) Promise.resolve(finishedCallback());
  });
}
