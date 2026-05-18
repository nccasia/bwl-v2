"use client";

import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";
import { useImageViewer } from "../hooks/use-image-viewer";

export function ImagePanel({ onClose }: { onClose?: () => void }) {
  const { state, handlers } = useImageViewer();
  const post = state.post;

  const handleClose = onClose || handlers.close;

  if (!post) return null;

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      style={{ background: "#050505" }}
    >
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <ToolbarButton
          onClick={handlers.toggleZoom}
          aria-label={state.isZoomed ? "Zoom out" : "Zoom in"}
        >
          {state.isZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
        </ToolbarButton>

        <ToolbarButton
          onClick={handlers.toggleFullscreen}
          aria-label={
            state.isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
          }
        >
          {state.isFullscreen ? (
            <Minimize2 size={16} />
          ) : (
            <Maximize2 size={16} />
          )}
        </ToolbarButton>

        <ToolbarButton
          onClick={handleClose}
          aria-label="Close"
          className="hover:bg-red-500/30 hover:text-red-300"
        >
          <X size={16} />
        </ToolbarButton>
      </div>

      {state.totalImages > 1 && (
        <div className="absolute top-4 left-4 z-30 px-3 py-1 rounded-full text-xs font-semibold text-white/70 bg-white/10 backdrop-blur-sm border border-white/10">
          {state.currentIndex + 1} / {state.totalImages}
        </div>
      )}

      <div
        className="w-full h-full flex items-center justify-center overflow-hidden cursor-zoom-in transition-all duration-300"
        onClick={handlers.toggleZoom}
        style={{ cursor: state.isZoomed ? "zoom-out" : "zoom-in" }}
      >
        <img
          src={state.currentImage}
          alt={`Image ${state.currentIndex + 1}`}
          className="max-h-full max-w-full object-contain select-none transition-transform duration-300 ease-in-out"
          style={{
            transform: state.isZoomed ? "scale(1.8)" : "scale(1)",
          }}
          draggable={false}
        />
      </div>

      {state.hasPrev && (
        <NavButton
          direction="left"
          onClick={(e) => {
            e.stopPropagation();
            handlers.goToPrev();
          }}
          aria-label="Previous image"
        >
          <ChevronLeft size={22} />
        </NavButton>
      )}

      {/* Nav — Next */}
      {state.hasNext && (
        <NavButton
          direction="right"
          onClick={(e) => {
            e.stopPropagation();
            handlers.goToNext();
          }}
          aria-label="Next image"
        >
          <ChevronRight size={22} />
        </NavButton>
      )}

      {state.totalImages > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {post.images.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-200"
              style={{
                width: i === state.currentIndex ? 20 : 6,
                height: 6,
                background:
                  i === state.currentIndex
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`w-8 h-8 flex items-center justify-center rounded-full text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-all duration-150 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function NavButton({
  direction,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  direction: "left" | "right";
}) {
  const pos = direction === "left" ? "left-4" : "right-4";
  return (
    <button
      className={`absolute ${pos} top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full text-white bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/10 transition-all duration-150 hover:scale-105 active:scale-95`}
      {...props}
    >
      {children}
    </button>
  );
}
