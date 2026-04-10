"use client";

import React from "react";
import { Button } from "@heroui/react";
import { Trash2 } from "lucide-react";

export interface MediaPreviewGridProps {
  urls: string[];
  onRemove: (index: number) => void;
}

export function MediaPreviewGrid({ urls, onRemove }: MediaPreviewGridProps) {
  if (urls.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
      {urls.map((url, index) => (
        <div
          key={url}
          className="relative group aspect-square rounded-xl overflow-hidden border border-divider"
        >
          <img
            src={url}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <Button
            isIconOnly
            size="sm"
            variant="secondary"
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white min-w-0 h-7 w-7 rounded-full"
            onPress={() => onRemove(index)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ))}
    </div>
  );
}
