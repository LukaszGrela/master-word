import { useLayoutEffect, useRef } from 'react';

type TCallback = () => void;

export const useRunAfterUpdate = () => {
  const afterPaintCallbackRef = useRef<null | TCallback>(null);

  useLayoutEffect(() => {
    if (afterPaintCallbackRef.current) {
      // call
      afterPaintCallbackRef.current();
      // reset
      afterPaintCallbackRef.current = null;
    }
  });

  return (callback: TCallback) => (afterPaintCallbackRef.current = callback);
};
