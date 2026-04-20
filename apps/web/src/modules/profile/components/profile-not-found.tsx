"use client";

import { Button } from "@heroui/react";
import { UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileNotFoundProps {
  username: string;
}

export function ProfileNotFound({ username }: ProfileNotFoundProps) {
  const router = useRouter();

  return (
    <div className="py-16 flex flex-col items-center gap-3 text-center">
      <div className="w-16 h-16 rounded-full bg-content2 flex items-center justify-center">
        <UserCheck size={28} className="text-muted-foreground" />
      </div>
      <p className="font-bold text-lg">User not found</p>
      <p className="text-muted-foreground text-sm">
        @{username} does not exist or may have been removed.
      </p>
      <Button
        variant="primary"
        className="rounded-full mt-2 bg-primary text-primary-foreground"
        onPress={() => router.back()}
      >
        Go back
      </Button>
    </div>
  );
}
