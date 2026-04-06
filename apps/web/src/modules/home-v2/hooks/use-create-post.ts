import { useState } from "react";
import { useAuthStore } from "@/stores/login/auth-store";

export function useCreatePost() {
    const [isOpen, setIsOpen] = useState(false);
      const user = useAuthStore((state) => state.user);

    return {
        state: {
            isOpen,
            setIsOpen,
            user,
        },
        handles: {
            handleOpen: () => setIsOpen(true),
            handleClose: () => setIsOpen(false),
        }
    };
}
    
