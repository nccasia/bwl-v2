import { Notification } from '@/types/notifications/notification';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const notificationClientService = {
  subscribe: async (
    accessToken: string,
    onNotification: (notification: Notification) => void,
    signal?: AbortSignal
  ): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/notifications/sse`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal,
      });
      if (!response.ok) throw new Error(response.statusText);

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      const processStream = async (incompleteLine = ""): Promise<void> => {
        const { value, done } = await reader.read();
        if (done) return;

        const content = incompleteLine + decoder.decode(value, { stream: true });
        const lines = content.split("\n");

        lines
          .filter((line) => line.startsWith("data:"))
          .forEach((line) => {
            try {
              onNotification(JSON.parse(line.replace("data:", "").trim()));
            } catch (e) {
              throw new Error(e as string);
            }
          });

        return processStream(lines.pop());
      };

      await processStream();
    } catch (e) {
      if ((e as Error).name === "AbortError") return;

      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new Error(errorMessage);
    }
  },
};
