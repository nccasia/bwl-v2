"use server";

import { channelService } from "@/services/channels/channel-service";

export async function getChannelsAction(page: number, limit: number = 10) {
  try {
    const result = await channelService.getChannels(page, limit);
    return result;
  } catch (e) {
    return {
      isSuccess: false,
      message: `${e}`,
      statusCode: 500,
      data: []
    };
  }
}
