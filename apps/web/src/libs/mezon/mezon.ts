'use client';

declare global {
  interface Window {
    Mezon?: {
      WebView?: {
        isIframe: boolean;
        initParams: Record<string, string | null>;
        postEvent: (eventType: string, eventData: unknown, callback?: (err?: unknown) => void) => void;
        onEvent: (eventType: string, handler: (eventType: string, eventData: unknown) => void) => void;
        offEvent: (eventType: string, handler: (eventType: string, eventData: unknown) => void) => void;
      };
    };
  }
}

const MEZON_CLAN_ID_STORAGE_KEY = 'mezon_clan_id';
const MEZON_SESSION_STORAGE_KEY = '__mezon__initParams';

function getMezonInitParams(): Record<string, string | null> {
  if (typeof window === 'undefined') return {};

  const sdkParams = window.Mezon?.WebView?.initParams;
  if (sdkParams && Object.keys(sdkParams).length > 0) {
    if (sdkParams['data']) return sdkParams;
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('data')) {
      const result: Record<string, string | null> = {};
      urlParams.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    }
  } catch {
  }

  if (sdkParams && Object.keys(sdkParams).length > 0) return sdkParams;

  try {
    const stored = window.sessionStorage.getItem(MEZON_SESSION_STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Record<string, string | null>;
  } catch {
    // ignore
  }

  return {};
}

export function isMezonWebView(): boolean {
  if (typeof window === 'undefined') return false;

  if (window.Mezon?.WebView?.isIframe === true) return true;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('data')) return true;
  } catch {
    // ignore
  }

  const params = getMezonInitParams();
  const data = params['data'];
  return typeof data === 'string' && data.length > 0;
}

export function getMezonInitData(): string | null {
  if (typeof window === 'undefined') return null;

  const params = getMezonInitParams();
  const data = params['data'];
  return typeof data === 'string' && data.length > 0 ? data : null;
}

export function getMezonClanId(): number | null {
  if (typeof window === 'undefined') return null;

  const params = getMezonInitParams();
  const clanIdStr = params['clan_id'];
  if (clanIdStr) {
    const parsed = parseInt(clanIdStr, 10);
    if (!isNaN(parsed)) return parsed;
  }

  const stored = localStorage.getItem(MEZON_CLAN_ID_STORAGE_KEY);
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed)) return parsed;
  }

  return null;
}

export function saveMezonClanId(id: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MEZON_CLAN_ID_STORAGE_KEY, String(id));
}

export function encodeInitData(raw: string): string {
  const bytes = new TextEncoder().encode(raw);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(binary);
}
