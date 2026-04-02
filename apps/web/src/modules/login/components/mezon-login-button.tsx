import Image from "next/image"
import { authClient } from "@/libs/auth-client"

export function MezonLoginButton() {
  const handleLogin = async () => {
    try {
        await authClient.signIn.social({
            provider: "mezon",
            callbackURL: "/?login=success"
        });
    } catch (e) {
        console.error(e);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center justify-center gap-3 w-full h-auto py-3 px-6 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300 rounded-2xl shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-medium cursor-pointer"
    >
      <div className="relative w-7 h-7 shrink-0">
        <Image
          src="/assets/images/mezon-logo.webp"
          alt="Mezon Logo"
          fill
          sizes="28px"
          className="object-contain"
        />
      </div>
      <span className="text-lg font-semibold">Login with Mezon</span>
    </button>
  )
}
