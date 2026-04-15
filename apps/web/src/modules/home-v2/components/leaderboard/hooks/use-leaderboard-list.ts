import { useTopChannels } from "@/modules/home-v2/hooks/use-top-channels";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export function useLeaderboardList() {
    const t = useTranslations("home");
    const {
        state: { leaderboard, isLoadingLeaderboard },
    } = useTopChannels();

    const displayLeaderboard = useMemo(() => {
        return leaderboard?.slice(0, 5) ?? [];
    }, [leaderboard]);

    const isEmpty = !isLoadingLeaderboard && displayLeaderboard.length === 0;

    return {
        state: {
            leaderboard: displayLeaderboard,
            isLoadingLeaderboard,
            isEmpty,
            t,
        },
    };
}
