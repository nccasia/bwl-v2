"use client";

import { Link } from "@/navigation";
import { type AuthUser } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useSlideBar } from "./hook/useSlidebar";
interface SidebarProps {
  user?: AuthUser | null;
}

export default function Sidebar({ user: userProp }: SidebarProps) {
  const {state, actions} = useSlideBar({user: userProp});

  return (
    <aside className="w-20 lg:w-64 h-screen sticky top-0 z-50 border-r border-border bg-background/90 backdrop-blur-xl flex flex-col shadow-2xl">
      <div className="p-4 lg:p-6 flex-1 overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-4 group transition-all duration-300">
            <div className="absolute" />
            <img
              src="/assets/img/mezon-logo.webp"
              alt="BWL Logo"
              className="w-9 h-9 object-contain relative z-10 rounded-full"
            />

            <div className="hidden lg:flex flex-col select-none">
              <h1 className="text-2xl font-black tracking-tighter bg-linear-to-r from-foreground via-foreground to-accent bg-clip-text text-transparent group-hover:opacity-80 transition-all">
                BWL
              </h1>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground -mt-1 group-hover:text-accent/50 transition-colors">
                Social
              </span>
            </div>
          </Link>
          <div className="hidden lg:block cursor-pointer">
            <ThemeToggle />
          </div>
        </div>

        <div className="lg:hidden flex justify-center mb-8 cursor-pointer">
          <ThemeToggle />
        </div>

        <nav className="space-y-3">
          {state.navItems.map((item) => {
            if (item.path === "logout") {
              return (
                <button
                  key="logout"
                  onClick={actions.handleLogout}
                  className="w-full cursor-pointer flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden text-muted-foreground hover:text-red-400 hover:bg-red-500/5 hover:translate-x-1"
                >
                  <div className="relative">
                    <item.icon className="w-6 h-6 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <span className="hidden lg:block font-medium">
                    {item.label}
                  </span>
                  <div className="absolute inset-0 bg-linear-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            }



            const isActive =
              state.pathname === item.path ||
              (item.path !== "/" && state.pathname?.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${isActive
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-muted-foreground hover:text-accent hover:bg-accent/5 hover:translate-x-1"
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 w-1 h-full bg-accent shadow-[0_0_15px_var(--accent)]" />
                )}
                <div className="relative">
                  <Icon className={`w-6 h-6 shrink-0 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                  {item.label === "Notifications" && state.unread > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-background animate-pulse">
                      {state.unread > 99 ? "99+" : state.unread}
                    </span>
                  )}
                </div>
                <span className={`hidden lg:block font-medium ${isActive ? "text-accent dark:text-white" : ""}`}>
                  {item.label}
                </span>
                {!isActive && (
                  <div className="absolute inset-0 bg-linear-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {state.user && (
        <div className="p-2 lg:p-4 border-t border-border mt-auto">
          <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3">
            {state.user.avatar ? (
              <img
                src={state.user.avatar}
                alt={state.user.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-accent/50 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">
                  {state.user.username?.[0]?.toUpperCase() ?? "U"}
                </span>
              </div>
            )}
            <div className="hidden lg:block flex-1 min-w-0">
              <p className="text-foreground text-sm font-bold truncate">{state.user.username}</p>
              <p className="text-muted-foreground text-[10px] font-medium truncate tracking-tight">@{state.user.username}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
