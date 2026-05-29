interface MezonWebView {
  isIframe: boolean;
  initParams: Record<string, string>;
  postEvent(
    event: string,
    data?: unknown,
    callback?: (err?: Error) => void,
  ): void;
  onEvent(event: string, callback: (data: unknown) => void): void;
}

interface Window {
  Mezon?: {
    WebView?: MezonWebView;
  };
}
