'use client';

import { getMezonClanID, getMezonRawDataFromUrl, isMezonWebView, markAsWebView, saveMezonClanID } from '@/utils/mezon';
import { useAuthStore } from '@/stores/login/auth-store';
import { mezonWebViewService } from '@/services/auth/mezon-webview-service';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface MezonWebViewContextValue {
  isWebView: boolean;
  clanId: number | null;
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
}

const MezonWebViewContext = createContext<MezonWebViewContextValue>({
  isWebView: false,
  clanId: null,
  isReady: true,
  isLoading: false,
  error: null,
});

function getCookieToken(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function MezonWebViewProvider({ children }: { children: React.ReactNode }) {
  const isWebView = isMezonWebView();
  const [clanId, setClanId] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(!isWebView);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const hasFired = useRef(false);

  const { setSession, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (hasFired.current) return;

    const rawData = getMezonRawDataFromUrl();
    const cookieToken = getCookieToken('mezon_webview_token');

    // Case 1: No WebView context at all — nothing to do.
    if (!isWebView && !rawData && !cookieToken) {
      return;
    }

    hasFired.current = true;
    if (rawData) {
      markAsWebView();

      const clan = getMezonClanID();
      if (clan !== null) {
        setClanId(clan);
        saveMezonClanID(clan);
      }

      setIsLoading(true);

      mezonWebViewService
        .loginWithWebViewData(btoa(unescape(encodeURIComponent(rawData))))
        .then((token) => {
          localStorage.setItem('accessToken', token.accessToken);
          document.cookie = `mezon_webview_token=${token.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          markAsWebView();
          setSession({
            id: token.userId,
            userName: token.userName,
            email: token.email ?? undefined,
            accessToken: token.accessToken,
            avatar: undefined,
          });
          // Redirect away from /channel entry URL after login
          if (typeof window !== 'undefined' && window.location.pathname.startsWith('/channel')) {
            router.replace('/');
          }
        })
        .catch((err: unknown) => {
          const e = err instanceof Error ? err : new Error(String(err));
          console.error('[MezonWebView] Auto-login failed:', e);
          setError(e);
        })
        .finally(() => {
          setIsLoading(false);
          setIsReady(true);
        });

      return;
    }

    // Case 3: No fresh initData (app restored from background / minimized),
    // but the mezon_webview_token cookie is still valid.
    // Restore the session from the JWT so the user stays logged in.
    if (cookieToken && !user) {
      const payload = decodeJwtPayload(cookieToken);
      const exp = typeof payload?.exp === 'number' ? payload.exp : 0;

      if (exp * 1000 > Date.now()) {
        // Token is still valid — restore session directly without an API round-trip.
        markAsWebView();
        localStorage.setItem('accessToken', cookieToken);
        setSession({
          id: (payload?.userId as string) ?? '',
          userName: (payload?.userName as string) ?? '',
          email: (payload?.email as string) ?? undefined,
          accessToken: cookieToken,
          avatar: undefined,
        });
      }
      // If expired: cookie will be ignored; user must re-open the app via Mezon.
    }

    setIsReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MezonWebViewContext.Provider value={{ isWebView, clanId, isReady, isLoading, error }}>
      {children}
    </MezonWebViewContext.Provider>
  );
}

export function useMezonWebView() {
  return useContext(MezonWebViewContext);
}
