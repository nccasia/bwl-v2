import { apiClient } from "@/libs/api-client";
import { Channel } from "@/types/channels/channel";

export async function getChannels(page: number, limit: number = 10) {
  const param = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    const response = await apiClient.get<Channel[]>(
      `/v1/channels/get-channels?${param}`,
    );
    return response;
}

