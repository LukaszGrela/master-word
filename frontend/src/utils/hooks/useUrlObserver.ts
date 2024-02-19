import { useCallback, useEffect, useRef, useState } from 'react';

export type TUseUrlObserver = [href: string, disconnect: () => void];
export const useUrlObserver = (): TUseUrlObserver => {
  const [href, setHref] = useState('');

  const observerRef = useRef<MutationObserver | null>(null);

  // stop listening
  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  // listen to changes
  useEffect(() => {
    observerRef.current = new MutationObserver(function () {
      if (window && window.location.href !== href) {
        setHref(window.location.href);
      }
    });

    if (observerRef.current && document) {
      observerRef.current.observe(document);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [href]);

  return [href, disconnect];
};
