"use server";

import { getCurrentUser } from "./user-service";

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
