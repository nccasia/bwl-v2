"use server";

import { getCurrentUser, userService } from "./user-service";

export async function getCurrentUserAction(accessToken: string) {
  try {
    const result = await getCurrentUser(accessToken);
    return result;
  } catch (e) {
    return {
      isSuccess: false,
      data: null,
      message: `${e}`,
    };
  }
}

export async function getUserByIdAction(userId: string, accessToken: string) {
  try {
    return await userService.getUserById(userId, accessToken);
  } catch (e) {
    return {
      isSuccess: false,
      data: null,
      message: `${e}`,
    };
  }
}

