
const MEZON_WEBVIEW_FLAG_KEY = 'mezon_is_webview';
const MEZON_CLAN_ID_KEY = 'mezon_clan_id';


export function isMezonWebView(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.Mezon?.WebView?.isIframe === true) return true;
  if (new URLSearchParams(location.search).get('data')) return true;
  const initData = window.Mezon?.WebView?.initParams?.['data'];
  if (typeof initData === 'string' && initData.length > 0) return true;
  return localStorage.getItem(MEZON_WEBVIEW_FLAG_KEY) === 'true';
}


export function markAsWebView(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MEZON_WEBVIEW_FLAG_KEY, 'true');
  }
}

export function clearWebViewFlag(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(MEZON_WEBVIEW_FLAG_KEY);
  }
}

export function getMezonRawDataFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const urlData = new URLSearchParams(location.search).get('data');
  if (urlData) return urlData;
  const initData = window.Mezon?.WebView?.initParams?.['data'];
  if (typeof initData === 'string' && initData.length > 0) return initData;
  return null;
}

export function getMezonClanID(): number | null {
  if (typeof window === 'undefined') return null;
  const urlClanId = new URLSearchParams(location.search).get('clan_id');
  if (urlClanId) {
    const parsed = parseInt(urlClanId, 10);
    if (!isNaN(parsed)) return parsed;
  }
  const initClanId = window.Mezon?.WebView?.initParams?.['clan_id'];
  if (typeof initClanId === 'string' && initClanId.length > 0) {
    const parsed = parseInt(initClanId, 10);
    if (!isNaN(parsed)) return parsed;
  }
  const stored = localStorage.getItem(MEZON_CLAN_ID_KEY);
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return null;
}

export function saveMezonClanID(id: number): void {
  localStorage.setItem(MEZON_CLAN_ID_KEY, String(id));
}

export function base64EncodeUtf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(binary);
}
