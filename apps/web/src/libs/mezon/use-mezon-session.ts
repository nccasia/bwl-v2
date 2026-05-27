'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MezonAppEvent, MezonWebViewEvent } from './use-mezon-webview';

export interface UseMezonSessionReturn {
  isConnected: boolean;
}

const PING_INTERVAL_MS = 5000;
const MAX_PONG_WAIT_MS = 3000;

export function useMezonSession(): UseMezonSessionReturn {
  const [isConnected, setIsConnected] = useState(false);
  const pongTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (pongTimeoutRef.current) clearTimeout(pongTimeoutRef.current);
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sdk = (window as unknown as {
      Mezon?: {
        WebView?: {
          isIframe: boolean;
          postEvent: (eventType: string, eventData: unknown, callback?: () => void) => void;
          onEvent: (eventType: string, handler: (eventType: string, eventData: unknown) => void) => void;
          offEvent: (eventType: string, handler: (eventType: string, eventData: unknown) => void) => void;
        };
      };
    }).Mezon?.WebView;
    if (!sdk?.isIframe) return;

    const handlePong = () => {
      if (pongTimeoutRef.current) clearTimeout(pongTimeoutRef.current);
      setIsConnected(true);
    };

    const sendPing = () => {
      sdk.postEvent(MezonWebViewEvent.PING, {}, () => {});
      pongTimeoutRef.current = setTimeout(() => {
        setIsConnected(false);
      }, MAX_PONG_WAIT_MS);
    };

    sdk.onEvent(MezonAppEvent.PONG, handlePong);

    // Send initial PING immediately
    sendPing();
    pingIntervalRef.current = setInterval(sendPing, PING_INTERVAL_MS);

    return () => {
      clearTimers();
      sdk.offEvent(MezonAppEvent.PONG, handlePong);
    };
  }, [clearTimers]);

  return { isConnected };
}
