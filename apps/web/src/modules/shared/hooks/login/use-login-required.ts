import { useLoginRequiredStore } from "@/stores/shared/login-required-store";
import { useRouter } from "next/navigation";

export function useLoginRequired() {
  const store = useLoginRequiredStore();
  const router = useRouter();

  const handleLogin = () => {
    store.close();
    router.push("/login");
  };

  const handleCancel = () => {
    store.close();
  };

  return {
    state: {
      isOpen: store.isOpen,
    },
    actions: {
      close: store.close,
      handleLogin,
      handleCancel,
    },
  };
}
