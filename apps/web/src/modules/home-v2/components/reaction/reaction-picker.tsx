import { ReactionType, ReactionTypeValues } from "@/schemas/post/reaction";
import { useTranslations } from "next-intl";
import data from "@emoji-mart/data";
import { cn } from "@heroui/react";

const REACTION_CONFIG: Record<ReactionType, { id: string }> = {
  LIKE: { id: "+1" },
  LOVE: { id: "heart" },
  HAHA: { id: "laughing" },
  WOW: { id: "open_mouth" },
  SAD: { id: "cry" },
  ANGRY: { id: "rage" },
};

const getEmoji = (id: string) => {
  const emojiData = (data as { emojis: Record<string, { skins: { native: string }[] }> }).emojis[id];
  return emojiData?.skins[0]?.native || "❓";
};

interface ReactionPickerProps {
  onSelect: (type: ReactionType) => void;
  className?: string;
}

export function ReactionPicker({ onSelect, className }: ReactionPickerProps) {
  const t = useTranslations("reactions");

  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 bg-background/95 backdrop-blur-md rounded-full shadow-2xl border border-divider/50",
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
        className,
      )}
    >
      {ReactionTypeValues.map((type, index) => (
        <button
          key={type}
          type="button"
          onClick={() => onSelect(type)}
          title={t(type)}
          className={cn(
            "group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
            "hover:scale-125 hover:-translate-y-2 active:scale-100",
            "animate-in zoom-in-50 fade-in duration-500",
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <span className="text-2xl drop-shadow-md transform transition-transform group-hover:scale-110">
            {getEmoji(REACTION_CONFIG[type].id)}
          </span>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {t(type)}
          </span>
        </button>
      ))}
    </div>
  );
}
