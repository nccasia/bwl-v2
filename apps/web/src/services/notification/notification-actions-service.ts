"use server";

import { QueryParams } from "@/types/shared/base-api";
import { getNotifications, markAllAsRead, markAsRead } from "./notification-service";

export async function getNotificationsAction(queryOptions?: QueryParams) {
  try {
    const response = await getNotifications(queryOptions);
    return response;
  } catch (error) {
    return {
      isSuccess: false,
      message: `${error}`,
      statusCode: 500,
    };
  }
}

export async function markAsReadAction(id: string) {
  try {
    const response = await markAsRead(id);
    return response;
  } catch (error) {
    return {
      isSuccess: false,
      message: `${error}`,
      statusCode: 500,
    };
  }
}

export async function markAllAsReadAction() {
  try {
    const response = await markAllAsRead();
    return response;
  } catch (error) {
    return {
      isSuccess: false,
      message: `${error}`,
      statusCode: 500,
    };
  }
}
