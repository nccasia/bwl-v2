import { useCallback, useMemo, useRef, useState } from "react";

interface UseInViewOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
  onInView?: () => void;
}

export function useInView(options: UseInViewOptions = {}) {
  const { triggerOnce = false, onInView, ...observerOptions } = options;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const observerOptionsRef = useRef(observerOptions);
  observerOptionsRef.current = observerOptions;

  const [isInView, setIsInView] = useState(false);

  // Stable serialized key so useCallback can depend on a primitive
  const observerOptionsKey = useMemo(
    () => JSON.stringify(observerOptions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(observerOptions)]
  );

  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (node) {
        const observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            onInView?.();
            if (triggerOnce) {
              observer.unobserve(node);
              observer.disconnect();
              observerRef.current = null;
            }
          } else if (!triggerOnce) {
            setIsInView(false);
          }
        }, observerOptionsRef.current);

        observer.observe(node);
        observerRef.current = observer;
      }
    },
    [triggerOnce, onInView, observerOptionsKey]
  );

  return { ref, isInView };
}

