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
    const data = await userService.getUserById(userId, accessToken);
    return {
      isSuccess: true,
      data,
      message: "Successfully fetched user profile",
    };
  } catch (e) {
    return {
      isSuccess: false,
      data: null,
      message: `${e}`,
    };
  }
}

