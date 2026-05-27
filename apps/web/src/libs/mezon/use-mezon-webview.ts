'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export enum MezonWebViewEvent {
  IframeReady = 'iframe_ready',
  IframeWillReloaded = 'iframe_will_reload',
  PING = 'PING',
  SEND_BOT_ID = 'SEND_BOT_ID',
  SEND_TOKEN = 'SEND_TOKEN',
  GET_CLAN = 'GET_CLAN',
  GET_CLAN_ROLES = 'GET_CLAN_ROLES',
  GET_CLAN_USERS = 'GET_CLAN_USERS',
  GET_CHANNEL = 'GET_CHANNEL',
  GET_CHANNELS = 'GET_CHANNELS',
  CHECK_MICROPHONE_STATUS = 'CHECK_MICROPHONE_STATUS',
  TOGGLE_MICROPHONE = 'TOGGLE_MICROPHONE',
  JOIN_ROOM = 'JOIN_ROOM',
  LEAVE_ROOM = 'LEAVE_ROOM',
  CREATE_VOICE_ROOM = 'CREATE_VOICE_ROOM',
}

export enum MezonAppEvent {
  ThemeChanged = 'theme_changed',
  ViewPortChanged = 'viewport_changed',
  SetCustomStyle = 'set_custom_style',
  ReloadIframe = 'reload_iframe',
  PONG = 'PONG',
  CURRENT_USER_INFO = 'CURRENT_USER_INFO',
  USER_HASH_INFO = 'USER_HASH_INFO',
  SEND_TOKEN_RESPONSE_SUCCESS = 'SEND_TOKEN_RESPONSE_SUCCESS',
  SEND_TOKEN_RESPONSE_FAILED = 'SEND_TOKEN_RESPONSE_FAILED',
  CLAN_RESPONSE = 'CLAN_RESPONSE',
  CLAN_ROLES_RESPONSE = 'CLAN_ROLES_RESPONSE',
  CLAN_USERS_RESPONSE = 'CLAN_USERS_RESPONSE',
  CHANNELS_RESPONSE = 'CHANNELS_RESPONSE',
  CHANNEL_RESPONSE = 'CHANNEL_RESPONSE',
  MICROPHONE_STATUS = 'MICROPHONE_STATUS',
  TOGGLE_MICROPHONE = 'TOGGLE_MICROPHONE',
}

// ─────────────────────────────────────────────────────────────────────────────

type InitParams = Record<string, string | null>;
type EventHandler = (eventType: string, eventData: unknown) => void;

interface MezonSDK {
  isIframe: boolean;
  initParams: InitParams;
  postEvent: (eventType: string, eventData: unknown, callback?: (err?: unknown) => void) => void;
  onEvent: (eventType: string, handler: EventHandler) => void;
  offEvent: (eventType: string, handler: EventHandler) => void;
}

function getSDK(): MezonSDK | null {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { Mezon?: { WebView?: MezonSDK } }).Mezon?.WebView ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────

export interface UseMezonWebViewReturn {
  isIframe: boolean;
  initParams: InitParams;
  postEvent: (eventType: MezonWebViewEvent, eventData?: unknown, callback?: (err?: unknown) => void) => void;
  onEvent: (eventType: MezonAppEvent, handler: EventHandler) => void;
  offEvent: (eventType: MezonAppEvent, handler: EventHandler) => void;
}

export function useMezonWebView(): UseMezonWebViewReturn {
  const [isIframe, setIsIframe] = useState(false);
  const [initParams, setInitParams] = useState<InitParams>({});
  const sdkRef = useRef<MezonSDK | null>(null);

  useEffect(() => {
    const sdk = getSDK();
    sdkRef.current = sdk;
    if (!sdk) return;
    setIsIframe(sdk.isIframe);
    setInitParams(sdk.initParams ?? {});
  }, []);

  const postEvent = useCallback((eventType: MezonWebViewEvent, eventData?: unknown, callback?: (err?: unknown) => void) => {
    const sdk = sdkRef.current ?? getSDK();
    if (!sdk) { callback?.({ notAvailable: true }); return; }
    sdk.postEvent(eventType, eventData ?? {}, callback);
  }, []);

  const onEvent = useCallback((eventType: MezonAppEvent, handler: EventHandler) => {
    const sdk = sdkRef.current ?? getSDK();
    sdk?.onEvent(eventType, handler);
  }, []);

  const offEvent = useCallback((eventType: MezonAppEvent, handler: EventHandler) => {
    const sdk = sdkRef.current ?? getSDK();
    sdk?.offEvent(eventType, handler);
  }, []);

  return { isIframe, initParams, postEvent, onEvent, offEvent };
}
