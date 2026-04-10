"use client";

import { Popover, Button, cn } from "@heroui/react";
import { Heart } from "lucide-react";
import { ReactionPicker } from "./reaction-picker";
import { usePostReaction } from "../../hooks/use-post-reaction";
import { ReactionType } from "@/schemas/post/reaction";
import { useTranslations } from "next-intl";
import data from "@emoji-mart/data";

const REACTION_CONFIG: Record<ReactionType, { id: string; color: string }> = {
  LIKE: { id: "+1", color: "text-blue-500" },
  LOVE: { id: "heart", color: "text-red-500" },
  HAHA: { id: "laughing", color: "text-yellow-500" },
  WOW: { id: "open_mouth", color: "text-yellow-500" },
  SAD: { id: "cry", color: "text-yellow-500" },
  ANGRY: { id: "rage", color: "text-orange-500" },
};

const getEmoji = (id: string) => {
  const emojiData = (data as { emojis: Record<string, { skins: { native: string }[] }> }).emojis[id];
  return emojiData?.skins[0]?.native || "❓";
};

interface ReactionButtonProps {
  postId: string;
  initialCount: number;
  onAction?: (action: () => void) => void;
}

export function ReactionButton({
  postId,
  initialCount,
  onAction,
}: ReactionButtonProps) {
  const { state, handles } = usePostReaction(postId, initialCount, onAction);
  const t = useTranslations("reactions");

  return (
    <div className="relative group/reaction-container">
      <Popover.Root isOpen={state.showPicker} onOpenChange={handles.setShowPicker}>
        <Popover.Trigger>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-muted-foreground font-bold gap-2 rounded-xl transition-all relative overflow-hidden",
              state.currentReaction
                ? REACTION_CONFIG[state.currentReaction].color
                : "hover:text-danger hover:bg-danger/10",
              state.isPending && "opacity-50 pointer-events-none",
            )}
            onMouseEnter={handles.handleMouseEnter}
            onMouseLeave={handles.handleMouseLeave}
            onPress={handles.handleOnPress}
          >
            {state.currentReaction ? (
              <span className="text-xl animate-in zoom-in-50 duration-300">
                {getEmoji(REACTION_CONFIG[state.currentReaction].id)}
              </span>
            ) : (
              <Heart
                size={18}
                className="fill-none group-hover/reaction-container:fill-current"
              />
            )}
            <span className="min-w-[12px]">{state.totalCount.toLocaleString()}</span>
            {state.currentReaction && (
              <span className="text-xs font-semibold animate-in slide-in-from-left-2 duration-300">
                {t(state.currentReaction)}
              </span>
            )}
          </Button>
        </Popover.Trigger>
        <Popover.Content placement="top" offset={10}>
          <Popover.Arrow />
          <Popover.Dialog
            className="p-0 bg-transparent border-none shadow-none"
            onMouseLeave={handles.handlePickerMouseLeave}
          >
            <ReactionPicker onSelect={handles.handleSelect} />
          </Popover.Dialog>
        </Popover.Content>
      </Popover.Root>
    </div>
  );
}
