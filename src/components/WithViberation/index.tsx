import { createElement, type JSX } from "preact";
import { PropsWithChildren } from "preact/compat";

type VibrationConfig = {
  vibrationPattern?: {
    pointerDown?: [number];
    pointerUp?: [number];
  };
};

export function withVibration<K extends keyof JSX.IntrinsicElements>(tag: K) {
  type Props = PropsWithChildren<JSX.IntrinsicElements[K] & VibrationConfig>;

  return ({ vibrationPattern, onPointerDown, onPointerUp, ...rest }: Props) => {
    return createElement(tag, {
      ...rest,
      onPointerDown: (e) => {
        navigator.vibrate?.(vibrationPattern?.pointerDown ?? [20, 5]);
        onPointerDown?.(e);
      },
      onPointerUp: (e) => {
        navigator.vibrate?.(vibrationPattern?.pointerUp ?? [10]);
        onPointerUp?.(e);
      },
    });
  };
}

const Button = withVibration("button");

const WithVibration = {
  Button,
};

export default WithVibration;
