'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useMezonWebView, MezonAppEvent, MezonWebViewEvent } from './use-mezon-webview';
import { useMezonSession } from './use-mezon-session';
import { useMezonAutoLogin, MezonAutoLoginStatus } from './use-mezon-auto-login';

export interface MezonContextValue {
  isIframe: boolean;
  isConnected: boolean;
  initParams: Record<string, string | null>;
  postEvent: (eventType: MezonWebViewEvent, eventData?: unknown, callback?: (err?: unknown) => void) => void;
  onEvent: (eventType: MezonAppEvent, handler: (eventType: string, eventData: unknown) => void) => void;
  offEvent: (eventType: MezonAppEvent, handler: (eventType: string, eventData: unknown) => void) => void;
  autoLoginStatus: MezonAutoLoginStatus;
  autoLoginError: string | null;
  retryAutoLogin: () => void;
}

const MezonContext = createContext<MezonContextValue | null>(null);

export function MezonProvider({ children }: { children: React.ReactNode }) {
  const { isIframe, initParams, postEvent, onEvent, offEvent } = useMezonWebView();
  const { isConnected } = useMezonSession();
  const { status: autoLoginStatus, error: autoLoginError, retry: retryAutoLogin } = useMezonAutoLogin();

  const value = useMemo<MezonContextValue>(
    () => ({
      isIframe,
      isConnected,
      initParams,
      postEvent,
      onEvent,
      offEvent,
      autoLoginStatus,
      autoLoginError,
      retryAutoLogin,
    }),
    [isIframe, isConnected, initParams, postEvent, onEvent, offEvent, autoLoginStatus, autoLoginError, retryAutoLogin],
  );

  return <MezonContext.Provider value={value}>{children}</MezonContext.Provider>;
}

export function useMezonContext(): MezonContextValue {
  const ctx = useContext(MezonContext);
  if (!ctx) throw new Error('useMezonContext must be used within <MezonProvider>');
  return ctx;
}

export function useMezonContextSafe(): MezonContextValue | null {
  return useContext(MezonContext);
}
