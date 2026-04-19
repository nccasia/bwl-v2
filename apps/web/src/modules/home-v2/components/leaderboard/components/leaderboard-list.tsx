import { Avatar, cn, EmptyState } from "@heroui/react";
import { Medal, MessageSquare } from "lucide-react";
import Link from "next/link";
import { LeaderboardSkeleton } from ".";
import { useLeaderboardList } from "../hooks";
export function LeaderboardList() {
  const { state } = useLeaderboardList();

  if (state.isLoadingLeaderboard) {
    return <LeaderboardSkeleton />;
  }

  if (state.isEmpty) {
    return (
      <EmptyState
        title={state.t("noLeaderboard")}
        className="py-10 bg-transparent border-none"
      />
    );
  }
  return (
    <div className="space-y-1.5 pt-2">
      {state.leaderboard.map((entry, index) => (
        <Link
          key={entry.id}
          href={`/profile/${entry.user.username}`}
          className={cn(
            "group flex items-center gap-3 p-2 rounded-2xl transition-all duration-300 hover:bg-content2/50 cursor-pointer",
            index === 0 && "bg-yellow-500/5 hover:bg-yellow-500/10",
          )}
        >
          <div className="relative flex-shrink-0">
            <Avatar className="w-10 h-10 border-2 border-background">
              <Avatar.Image src={entry.user.avatar ?? undefined} />
              <Avatar.Fallback>
                {entry.user.displayName?.charAt(0)}
              </Avatar.Fallback>
            </Avatar>
            {index < 3 && (
              <div
                className={cn(
                  "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm",
                  index === 0
                    ? "bg-yellow-500 text-white"
                    : index === 1
                      ? "bg-slate-300 text-slate-700"
                      : "bg-amber-600 text-white",
                )}
              >
                {index === 0 ? <Medal size={10} /> : index + 1}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[13px] text-foreground truncate group-hover:text-primary transition-colors">
              {entry.user.displayName}
            </h4>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare size={10} className="text-primary/60" />
              <span className="text-[11px] font-medium leading-none">
                {entry.postCount} {state.t("posts")}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="text-[11px] font-bold text-foreground bg-content3/50 px-2 py-0.5 rounded-full min-w-[24px] flex justify-center">
              {index + 1}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
