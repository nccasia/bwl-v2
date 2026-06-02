import type { Listener, Source } from 'react-hooks-sse';

const BASE_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

function parseSseChunk(
  buffer: string,
  dispatch: (eventName: string, data: string) => void,
): string {
  const events = buffer.split('\n\n');

  for (const rawEvent of events.slice(0, -1)) {
    const lines = rawEvent.split('\n');
    let eventName = 'message';
    let data = '';

    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventName = line.slice('event:'.length).trim();
      } else if (line.startsWith('data:')) {
        data = line.slice('data:'.length).trim();
      }
    }

    if (data) {
      dispatch(eventName, data);
    }
  }

  return events.at(-1) ?? '';
}

export function createAuthenticatedSseSource(
  endpoint: string,
  accessToken: string,
): Source {
  const listenersByName = new Map<string, Set<Listener>>();
  let abortController: AbortController | null = null;
  let reconnectAttempt = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;
  let activeConnections = 0;

  const getListenerCount = () =>
    [...listenersByName.values()].reduce((total, set) => total + set.size, 0);

  const dispatch = (eventName: string, data: string) => {
    listenersByName.get(eventName)?.forEach((listener) => {
      listener({ data });
    });
  };

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const scheduleReconnect = () => {
    if (closed || getListenerCount() === 0) return;

    const delay = Math.min(
      BASE_RECONNECT_DELAY_MS * 2 ** reconnectAttempt,
      MAX_RECONNECT_DELAY_MS,
    );
    reconnectAttempt += 1;

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      void startStream();
    }, delay);
  };

  const startStream = async () => {
    if (closed || getListenerCount() === 0 || activeConnections > 0) return;

    clearReconnectTimer();
    abortController?.abort();
    abortController = new AbortController();
    activeConnections += 1;

    try {
      const response = await fetch(
        `${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${encodeURIComponent(accessToken)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'text/event-stream',
          },
          signal: abortController.signal,
        },
      );

      if (!response.ok) {
        throw new Error(response.statusText || `SSE failed (${response.status})`);
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      reconnectAttempt = 0;
      const decoder = new TextDecoder();
      let buffer = '';

      while (!abortController.signal.aborted) {
        const { value, done } = await reader.read();
        if (done) {
          if (buffer.trim()) {
            parseSseChunk(`${buffer}\n\n`, dispatch);
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        buffer = parseSseChunk(buffer, dispatch);
      }
    } catch(e) {
      console.error('SSE connection error:', e);
    } finally {
      activeConnections = Math.max(0, activeConnections - 1);

      if (
        !closed &&
        getListenerCount() > 0 &&
        abortController?.signal.aborted !== true
      ) {
        scheduleReconnect();
      }
    }
  };

  return {
    addEventListener(name: string, listener: Listener) {
      const listeners = listenersByName.get(name) ?? new Set<Listener>();
      listeners.add(listener);
      listenersByName.set(name, listeners);

      if (getListenerCount() === 1) {
        void startStream();
      }
    },
    removeEventListener(name: string, listener: Listener) {
      const listeners = listenersByName.get(name);
      if (!listeners) return;

      listeners.delete(listener);
      if (!listeners.size) {
        listenersByName.delete(name);
      }

      if (getListenerCount() === 0) {
        closed = true;
        clearReconnectTimer();
        abortController?.abort();
        abortController = null;
        activeConnections = 0;
      }
    },
    close() {
      closed = true;
      clearReconnectTimer();
      abortController?.abort();
      abortController = null;
      activeConnections = 0;
      listenersByName.clear();
    },
  };
}
