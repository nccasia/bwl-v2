"use client";

import { authClient } from "@/libs/auth-client";
import { useCallback, useState } from "react";

const DEFAULT_CALLBACK_URL = "/?login=success";

export function useMezonLogin(callbackURL = DEFAULT_CALLBACK_URL) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await authClient.signIn.oauth2({
        providerId: "mezon",
        callbackURL,
      });

      if (authError) {
        setError(authError.message ?? "Login failed");
        return;
      }

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }, [callbackURL]);

  return { login, isLoading, error };
}
