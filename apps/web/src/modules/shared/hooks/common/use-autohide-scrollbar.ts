import { useRef, useCallback } from "react";


export function useAutoHideScrollbar(timeout = 2000) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const element = e.currentTarget;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!element.classList.contains("is-scrolling")) {
      element.classList.add("is-scrolling");
    }
    timeoutRef.current = setTimeout(() => {
      element.classList.remove("is-scrolling");
      timeoutRef.current = null;
    }, timeout);
  }, [timeout]);

  return { onScroll };
}
