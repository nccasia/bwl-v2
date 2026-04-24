"use client";

import { createPortal } from "react-dom";
import { ImagePanel } from "./image-panel";
import { CommentSidebar } from "./comment-sidebar";
import { useImageViewer } from "../hooks/use-image-viewer";

export function ImageViewer({
  onClose,
}: {
  onClose: () => void;
}) {
  const { state } = useImageViewer();

  if (!state.isMounted || !state.isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
        style={{
          animation: "fadeIn 0.2s ease-out",
        }}
      />

      <div
        className="relative z-10 flex w-full h-full"
        style={{ animation: "slideIn 0.25s ease-out" }}
      >
        <div
          className="flex-[4] relative overflow-hidden"
          style={{ minWidth: 0 }}
        >
          <ImagePanel onClose={onClose} />
        </div>

        <div
          className="flex-[1] flex flex-col overflow-hidden"
          style={{ minWidth: 280, maxWidth: 360 }}
          onClick={(e) => e.stopPropagation()}
        >
          <CommentSidebar />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body,
  );
}
