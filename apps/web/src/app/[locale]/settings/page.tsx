"use client";

import { Sun, Moon, Palette, Bell, BellOff, Check, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { useCustomColor } from "@/components/theme/CustomColorProvider";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useSettings } from "@/hooks/useSettings";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/navigation";

const brandColors = [
  { name: "Neon Purple", value: "#A855F7" as const, gradient: "from-purple-600 to-purple-400" },
  { name: "Electric Blue", value: "#3B82F6" as const, gradient: "from-blue-600 to-blue-400" },
  { name: "Sunset Orange", value: "#F97316" as const, gradient: "from-orange-600 to-orange-400" },
  { name: "Emerald Green", value: "#10B981" as const, gradient: "from-emerald-600 to-emerald-400" },
];

export default function SettingsPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const { accentColor: brandColor, setAccentColor: setBrandColor } = useCustomColor();
  const { muteMessages, toggleMuteMessages } = useSettings();
  const colors = useThemeColors();
  const t = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const theme = resolvedTheme === "light" ? "light" : "dark";

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLanguageChange = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
  };

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl mb-2 transition-colors duration-300"
            style={{ color: colors.text, fontFamily: "Inter, system-ui, sans-serif" }}
          >
            {t("title")}
          </h1>
          <p
            className="text-lg transition-colors duration-300"
            style={{ color: colors.textMuted }}
          >
            {t("subtitle")}
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Theme Toggle - Large Card */}
          <div
            className="lg:col-span-2 rounded-3xl backdrop-blur-xl p-8 transition-all duration-300 hover:shadow-2xl"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2
                  className="text-2xl mb-2 transition-colors duration-300"
                  style={{ color: colors.text }}
                >
                  {t("appearance")}
                </h2>
                <p
                  className="transition-colors duration-300"
                  style={{ color: colors.textMuted }}
                >
                  {t("appearance-desc")}
                </p>
              </div>
              <div
                className="p-3 rounded-2xl"
                style={{ backgroundColor: colors.hoverBg }}
              >
                {theme === "light" ? (
                  <Sun className="w-6 h-6" style={{ color: colors.accent }} />
                ) : (
                  <Moon className="w-6 h-6" style={{ color: colors.accent }} />
                )}
              </div>
            </div>

            {/* Theme Toggle Switch */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="p-3 rounded-xl transition-colors duration-300"
                  style={{
                    backgroundColor: theme === "light" ? colors.accent : colors.hoverBg,
                    color: theme === "light" ? "#FFFFFF" : colors.textMuted,
                  }}
                >
                  <Sun className="w-5 h-5" />
                </div>
                <span
                  className="transition-colors duration-300"
                  style={{ color: colors.text }}
                >
                  {t("light-mode")}
                </span>
              </div>

              <button
                onClick={toggleTheme}
                className="relative w-20 h-10 rounded-full transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: theme === "dark" ? colors.accent : colors.inputBorder,
                }}
              >
                <div
                  className="absolute top-1 left-1 w-8 h-8 rounded-full bg-white shadow-lg transition-transform duration-300 flex items-center justify-center"
                  style={{
                    transform: theme === "dark" ? "translateX(40px)" : "translateX(0)",
                  }}
                >
                  {theme === "light" ? (
                    <Sun className="w-4 h-4" style={{ color: colors.accent }} />
                  ) : (
                    <Moon className="w-4 h-4" style={{ color: colors.accent }} />
                  )}
                </div>
              </button>

              <div className="flex items-center gap-4">
                <span
                  className="transition-colors duration-300"
                  style={{ color: colors.text }}
                >
                  {t("dark-mode")}
                </span>
                <div
                  className="p-3 rounded-xl transition-colors duration-300"
                  style={{
                    backgroundColor: theme === "dark" ? colors.accent : colors.hoverBg,
                    color: theme === "dark" ? "#FFFFFF" : colors.textMuted,
                  }}
                >
                  <Moon className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div
            className="rounded-3xl backdrop-blur-xl p-8 transition-all duration-300 hover:shadow-2xl flex flex-col items-center justify-center text-center"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div
              className="w-20 h-20 rounded-3xl mb-4 flex items-center justify-center"
              style={{ backgroundColor: colors.accent }}
            >
              <span className="text-4xl">✦</span>
            </div>
            <h3
              className="text-xl mb-2 transition-colors duration-300"
              style={{ color: colors.text }}
            >
              {theme === "light" ? t("light-theme") : t("dark-theme")}
            </h3>
            <p
              className="text-sm transition-colors duration-300"
              style={{ color: colors.textMuted }}
            >
              {t("active")}
            </p>
          </div>

          {/* Brand Color Customization */}
          <div
            className="lg:col-span-2 rounded-3xl backdrop-blur-xl p-8 transition-all duration-300 hover:shadow-2xl"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2
                  className="text-2xl mb-2 transition-colors duration-300"
                  style={{ color: colors.text }}
                >
                  {t("brand-color")}
                </h2>
                <p
                  className="transition-colors duration-300"
                  style={{ color: colors.textMuted }}
                >
                  {t("brand-color-desc")}
                </p>
              </div>
              <div
                className="p-3 rounded-2xl"
                style={{ backgroundColor: colors.hoverBg }}
              >
                <Palette className="w-6 h-6" style={{ color: colors.accent }} />
              </div>
            </div>

            {/* Color Swatches */}
            <div className="grid grid-cols-4 gap-4">
              {brandColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setBrandColor(color.value)}
                  className="relative group"
                >
                  <div
                    className={`w-full aspect-square rounded-3xl bg-linear-to-br ${color.gradient} transition-all duration-300 hover:scale-110 hover:shadow-xl`}
                    style={{
                      boxShadow: brandColor === color.value
                        ? `0 0 0 3px ${colors.bg}, 0 0 0 6px ${color.value}`
                        : "none",
                    }}
                  >
                    {brandColor === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                          <Check className="w-6 h-6" style={{ color: color.value }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <p
                    className="text-sm mt-3 text-center transition-colors duration-300"
                    style={{ color: brandColor === color.value ? colors.accent : colors.textMuted }}
                  >
                    {color.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Access Settings */}
          <div
            className="rounded-3xl backdrop-blur-xl p-8 transition-all duration-300 hover:shadow-2xl"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2
                  className="text-xl mb-2 transition-colors duration-300"
                  style={{ color: colors.text }}
                >
                  {t("quick-access")}
                </h2>
                <p
                  className="text-sm transition-colors duration-300"
                  style={{ color: colors.textMuted }}
                >
                  {t("toggle-settings")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={toggleMuteMessages}
                className="w-full p-4 rounded-2xl transition-all duration-300 flex items-center justify-between shadow-sm"
                style={{
                  backgroundColor: muteMessages ? `${colors.accent}20` : colors.hoverBg,
                  border: `1px solid ${muteMessages ? colors.accent : colors.cardBorder}`,
                }}
              >
                <div className="flex items-center gap-3">
                  {muteMessages ? (
                    <BellOff className="w-5 h-5" style={{ color: colors.accent }} />
                  ) : (
                    <Bell className="w-5 h-5" style={{ color: colors.textMuted }} />
                  )}
                  <span
                    className="text-sm transition-colors duration-300"
                    style={{ color: colors.text }}
                  >
                    {t("notifications")}
                  </span>
                </div>
                <div
                  className="w-12 h-6 rounded-full transition-all duration-300 relative"
                  style={{
                    backgroundColor: muteMessages ? colors.accent : colors.inputBorder,
                  }}
                >
                  <div
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300"
                    style={{
                      transform: muteMessages ? "translateX(24px)" : "translateX(0)",
                    }}
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div
            className="rounded-3xl backdrop-blur-xl p-8 transition-all duration-300 hover:shadow-2xl"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2
                  className="text-xl mb-2 transition-colors duration-300"
                  style={{ color: colors.text }}
                >
                  {t("language")}
                </h2>
                <p
                  className="text-sm transition-colors duration-300"
                  style={{ color: colors.textMuted }}
                >
                  {t("language-desc")}
                </p>
              </div>
              <div
                className="p-3 rounded-2xl"
                style={{ backgroundColor: colors.hoverBg }}
              >
                <Globe className="w-6 h-6" style={{ color: colors.accent }} />
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleLanguageChange("en")}
                className={`w-full p-4 rounded-2xl transition-all duration-300 flex items-center justify-between border ${locale === "en" ? "bg-accent text-white border-accent" : "border-border hover:bg-muted"
                  }`}
                style={{
                  backgroundColor: locale === "en" ? colors.accent : colors.hoverBg,
                  borderColor: locale === "en" ? colors.accent : colors.cardBorder,
                  color: locale === "en" ? "#FFFFFF" : colors.text,
                }}
              >
                <span className="font-medium">{t("english")}</span>
                {locale === "en" && <Check className="w-5 h-5" />}
              </button>
              <button
                onClick={() => handleLanguageChange("vi")}
                className={`w-full p-4 rounded-2xl transition-all duration-300 flex items-center justify-between border ${locale === "vi" ? "bg-accent text-white border-accent" : "border-border hover:bg-muted"
                  }`}
                style={{
                  backgroundColor: locale === "vi" ? colors.accent : colors.hoverBg,
                  borderColor: locale === "vi" ? colors.accent : colors.cardBorder,
                  color: locale === "vi" ? "#FFFFFF" : colors.text,
                }}
              >
                <span className="font-medium">{t("vietnamese")}</span>
                {locale === "vi" && <Check className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Messaging Settings - Full Width */}
          <div
            className="lg:col-span-3 rounded-3xl backdrop-blur-xl p-8 transition-all duration-300 hover:shadow-2xl"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2
                  className="text-2xl mb-2 transition-colors duration-300"
                  style={{ color: colors.text }}
                >
                  {t("messaging")}
                </h2>
                <p
                  className="transition-colors duration-300"
                  style={{ color: colors.textMuted }}
                >
                  {t("messaging-desc")}
                </p>
              </div>
            </div>

            <div>
              {/* Mute All Messages */}
              <div
                className="p-6 rounded-3xl transition-all duration-300"
                style={{
                  backgroundColor: muteMessages ? `${colors.accent}15` : colors.hoverBg,
                  border: `1px solid ${muteMessages ? colors.accent : colors.cardBorder}`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <BellOff
                        className="w-6 h-6"
                        style={{ color: muteMessages ? colors.accent : colors.textMuted }}
                      />
                      <h3
                        className="text-lg transition-colors duration-300"
                        style={{ color: colors.text }}
                      >
                        {t("mute-all")}
                      </h3>
                    </div>
                    <p
                      className="text-sm transition-colors duration-300"
                      style={{ color: colors.textMuted }}
                    >
                      {t("mute-all-desc")}
                    </p>
                  </div>
                  <button
                    onClick={toggleMuteMessages}
                    className="ml-4 relative w-16 h-8 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: muteMessages ? colors.accent : colors.inputBorder,
                    }}
                  >
                    <div
                      className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-lg transition-transform duration-300"
                      style={{
                        transform: muteMessages ? "translateX(32px)" : "translateX(0)",
                      }}
                    />
                  </button>
                </div>
                <div
                  className="text-sm px-3 py-1 rounded-lg inline-block font-bold"
                  style={{
                    backgroundColor: muteMessages ? colors.accent : colors.hoverBg,
                    color: muteMessages ? "#FFFFFF" : colors.textMuted,
                  }}
                >
                  {muteMessages ? t("muted") : t("active")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
