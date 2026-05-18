"use server";

import { getCurrentUser, getUserById } from "./user-service";

export interface ActionResponse<T> {
  isSuccess: boolean;
  data: T | null;
  message: string;
}

export async function getCurrentUserAction(accessToken: string): Promise<ActionResponse<any>> {
  try {
    const result = await getCurrentUser(accessToken);
    return {
      isSuccess: true,
      data: result.data,
      message: "Successfully fetched current user profile",
    };
  } catch (e) {
    return {
      isSuccess: false,
      data: null,
      message: `${e}`,
    };
  }
}

export async function getUserByIdAction(userId: string, accessToken: string): Promise<ActionResponse<any>> {
  try {
    const data = await getUserById(userId, accessToken);
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

