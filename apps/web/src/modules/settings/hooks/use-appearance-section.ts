import { useTheme } from "next-themes";
import React from "react";

export function useAppearanceSection() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";
  const [notifications, setNotifications] = React.useState(true)
  const [muteAll, setMuteAll] = React.useState(false);


  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);
  };

  return {
    state: {
      isDark,
      mounted,
      notifications,
      muteAll,
    },
    actions: {
      toggleTheme,
      setTheme,
      setNotifications,
      setMuteAll,
    }
  };
}
