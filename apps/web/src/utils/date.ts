/**
 * Formats a date string into a relative time (e.g., "5m ago", "2d ago").
 * @param dateStr ISO date string
 * @param t Translation function from useTranslations('home-v2')
 * @returns Formatted relative time string
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getRelativeTime = (dateStr: string, t: any): string => {
  const now = new Date();
  const then = new Date(dateStr);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (isNaN(then.getTime())) return "";

  if (diffInSeconds < 60) return t("justNow");
  
  if (diffInSeconds < 3600) {
    return t("minutesAgo", { count: Math.floor(diffInSeconds / 60) });
  }
  
  if (diffInSeconds < 86400) {
    return t("hoursAgo", { count: Math.floor(diffInSeconds / 3600) });
  }
  
  return t("daysAgo", { count: Math.floor(diffInSeconds / 86400) });
};
