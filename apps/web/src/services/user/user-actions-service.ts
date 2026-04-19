'use server'

import { userService } from "@/services/user/user-service";

export async function getUserByIdAction(userId: string, accessToken: string) {
  return await userService.getUserById(userId, accessToken);
}
