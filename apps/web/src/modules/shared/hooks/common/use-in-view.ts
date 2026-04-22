import { useCallback, useRef, useState } from "react";

interface UseInViewOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
  onInView?: () => void;
}

export function useInView(options: UseInViewOptions = {}) {
  const { triggerOnce = false, onInView, ...observerOptions } = options;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isInView, setIsInView] = useState(false);

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
        }, observerOptions);

        observer.observe(node);
        observerRef.current = observer;
      }
    },
    [triggerOnce, onInView, JSON.stringify(observerOptions)]
  );

  return { ref, isInView };
}

