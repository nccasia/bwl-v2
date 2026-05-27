'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getMezonInitData, getMezonClanId, saveMezonClanId, encodeInitData, isMezonWebView } from './mezon';

export type MezonAutoLoginStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseMezonAutoLoginReturn {
  status: MezonAutoLoginStatus;
  error: string | null;
  retry: () => void;
}

const MEZON_LOGIN_DONE_KEY = '__mezon_login_done__';

export function useMezonAutoLogin(): UseMezonAutoLoginReturn {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<MezonAutoLoginStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const lastHashRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isMezonWebView()) return;

    // Skip if already logged in during this session (prevents infinite reload loop)
    if (sessionStorage.getItem(MEZON_LOGIN_DONE_KEY)) {
      setStatus('success');
      return;
    }

    const raw = getMezonInitData();
    if (!raw) return;

    // Persist clan ID for later use (channel-specific features)
    const clanId = getMezonClanId();
    if (clanId != null) saveMezonClanId(clanId);

    // Deduplicate within the same mount cycle
    const hashData = encodeInitData(raw);
    if (lastHashRef.current === hashData) return;
    lastHashRef.current = hashData;

    setStatus('loading');
    setError(null);

    fetch('/api/auth/mezon-webview-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hashData }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.message ?? `mezon-webview-login failed: ${res.status}`);
        }
        const data = (json?.data ?? json) as {
          accessToken: string;
          userId: string;
          userName?: string;
          email?: string;
          displayName?: string;
          avatar?: string;
        };
        return data;
      })
      .then(async (userData) => {
        const sessionRes = await fetch('/api/auth/mezon-webview-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });

        if (!sessionRes.ok) {
          const errJson = await sessionRes.json().catch(() => ({}));
          throw new Error(
            (errJson as { message?: string })?.message ?? `Session creation failed: ${sessionRes.status}`,
          );
        }

        sessionStorage.setItem(MEZON_LOGIN_DONE_KEY, Date.now().toString());

        // Store the full user data so AuthSync can populate the store after redirect
        localStorage.setItem('accessToken', userData.accessToken);
        localStorage.setItem('mezon_session', JSON.stringify({
          id: userData.userId,
          userName: userData.userName,
          displayName: userData.displayName,
          avatar: userData.avatar,
          email: userData.email,
          accessToken: userData.accessToken,
        }));

        await queryClient.invalidateQueries();
        setStatus('success');

        window.location.href = '/';
      })
      .catch((err: Error) => {
        lastHashRef.current = null;
        setError(err.message ?? 'Authentication failed. Please try again.');
        setStatus('error');
      });
  }, [retryCount]);

  const retry = () => {
    sessionStorage.removeItem(MEZON_LOGIN_DONE_KEY);
    setRetryCount((c) => c + 1);
  };

  return { status, error, retry };
}
