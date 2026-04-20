import { Sun, Moon, LogOut, LogIn } from "lucide-react";
import { Button } from "@heroui/react";
import Link from "next/link";
import { cn } from "@/utils/utils";
import { BWLLogo } from "@/modules/shared/components/common/bwl-logo";
import { useSidebar } from "@/modules/shared/hooks/slide-bar/use-sidebar";
import { useAppearanceSection } from "@/modules/settings/hooks";

export function Sidebar() {
  const { state, actions } = useSidebar();
  const { state: appearance, actions: appearanceActions } = useAppearanceSection();

  if (!appearance?.mounted) return null;

  const isDark = appearance.isDark;
  const toggleTheme = appearanceActions.toggleTheme;

  return (
    <aside className="w-[320px] h-screen fixed left-0 top-0 border-r border-divider bg-background flex flex-col p-8 z-50 overflow-y-auto custom-scrollbar transition-colors">
      <Link href="/" className="px-4 mb-10 group cursor-pointer block">
        <BWLLogo useGradient size={48} />
      </Link>

      <nav className="flex-1 space-y-1">
        {state.filteredItems.map((item) => {
          const isActive = state.pathname === item.href;
          const label = state.t(item.translationKey);
          return (
            <Link
              key={item.translationKey}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group hover:bg-content2 active:scale-95",
                isActive
                  ? "bg-brand-gradient text-white shadow-lg shadow-brand-start/20"
                  : "text-muted-foreground hover:text-brand-start",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                  isActive ? "fill-white/20" : "group-hover:text-brand-start",
                )}
              />
              <span className="font-bold text-[15px] tracking-tight">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-8 border-t border-divider space-y-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-4 px-4 py-7 rounded-2xl text-muted-foreground hover:text-brand-start font-bold text-[15px] border-none hover:bg-brand-start/5 transition-all group"
          onPress={toggleTheme}
        >
          {isDark ? (
            <>
              <Sun className="w-5 h-5 group-hover:text-brand-start transition-colors" />
              {state.t("lightMode")}
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 group-hover:text-brand-start transition-colors" />
              {state.t("darkMode")}
            </>
          )}
        </Button>

        {state.isAuthenticated ? (
          <Button
            variant="ghost"
            className="w-full justify-start gap-4 px-4 py-7 rounded-2xl text-muted-foreground hover:text-danger font-bold text-[15px] border-none hover:bg-danger/10 transition-all"
            onPress={actions.handleLogout}
          >
            <LogOut className="w-5 h-5" />
            {state.t("logout")}
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="w-full justify-start gap-4 px-4 py-7 rounded-2xl font-bold text-[15px] shadow-lg shadow-brand-start/10 bg-brand-gradient text-white border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
            onPress={actions.handleLogin}
          >
            <LogIn className="w-5 h-5" />
            {state.t("login")}
          </Button>
        )}
      </div>
    </aside>
  );
}
