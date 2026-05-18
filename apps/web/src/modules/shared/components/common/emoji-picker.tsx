"use client";

import React from "react";
import { Popover, Button } from "@heroui/react";
import { Smile } from "lucide-react";
import { BaseEmoji } from "@/types/shared";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

export interface EmojiPickerProps {
  onEmojiSelect: (emoji: BaseEmoji) => void;
  trigger?: React.ReactNode;
}

export function EmojiPicker({ onEmojiSelect, trigger }: EmojiPickerProps) {
  return (
    <Popover.Root>
      <Popover.Trigger>
        {trigger || (
          <Button
            isIconOnly
            variant="secondary"
            className="bg-transparent hover:bg-content2 text-warning min-w-0 border-none shadow-none"
          >
            <Smile size={24} />
          </Button>
        )}
      </Popover.Trigger>
      <Popover.Content className="p-0 border-none shadow-none bg-transparent overflow-hidden z-[300]">
        <Picker
          data={data}
          onEmojiSelect={onEmojiSelect}
          theme="auto"
          skinTonePosition="none"
        />
      </Popover.Content>
    </Popover.Root>
  );
}
