"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/login/auth-store";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { user, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;

    if (user?.username) {
      router.replace(`/profile/${user.username}`);
    } else {
      router.replace("/login");
    }
  }, [user, hasHydrated, router]);

  return null;
}
