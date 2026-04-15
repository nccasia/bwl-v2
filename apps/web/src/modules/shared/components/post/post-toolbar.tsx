"use client";

import React from "react";
import { Button, Tooltip } from "@heroui/react";
import { Image as ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { EmojiPicker } from "../common/emoji-picker";
import { BaseEmoji } from "@/types/shared";

export interface PostToolbarProps {
  onImageClick: () => void;
  onEmojiSelect: (emoji: BaseEmoji) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PostToolbar({
  onImageClick,
  onEmojiSelect,
  fileInputRef,
  onFileChange,
}: PostToolbarProps) {
  const t = useTranslations("create-post-dialog");

  return (
    <div className="mt-4 p-3 border border-divider rounded-[12px] flex items-center justify-between shadow-sm">
      <span className="text-[15px] font-semibold text-foreground px-1 font-sans">
        {t("add-to-your-post")}
      </span>
      <div className="flex items-center gap-1">
        <input
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={onFileChange}
        />
        <Tooltip.Root>
          <Tooltip.Trigger>
            <Button
              isIconOnly
              variant="secondary"
              className="bg-transparent hover:bg-content2 text-success min-w-0 border-none shadow-none"
              onPress={onImageClick}
            >
              <ImageIcon size={24} />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content className="bg-content4 text-content4-foreground px-2 py-1 rounded text-xs">
            {t("add-photo-or-video")}
          </Tooltip.Content>
        </Tooltip.Root>

        <EmojiPicker onEmojiSelect={onEmojiSelect} />
      </div>
    </div>
  );
}
