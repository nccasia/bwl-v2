"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "../toast";

export function useLoginToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { success } = useToast();

  useEffect(() => {
    const loginStatus = searchParams.get("login");
    if (loginStatus === "success") {
      success("Logged in with Mezon!");
      
      const params = new URLSearchParams(searchParams.toString());
      params.delete("login");
      const newUrl = params.toString() ? `/?${params.toString()}` : "/";
      router.replace(newUrl);
    }
  }, [searchParams, router, success]);
}
