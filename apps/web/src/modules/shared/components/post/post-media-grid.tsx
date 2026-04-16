"use client";

import { AlertCircle } from "lucide-react";
import { usePostMediaGrid } from "@/modules/shared/hooks/image-viewer/use-post-media-grid";

export interface PostMediaGridProps {
  images: string[];
}

export function PostMediaGrid({ images }: PostMediaGridProps) {
  const { state, actions } = usePostMediaGrid(images);

  if (!images || images.length === 0) return null;

  const renderGrid = () => {
    const count = images.length;

    if (count === 1) {
      return (
        <div
          className="relative aspect-auto max-h-[600px] w-full overflow-hidden rounded-2xl bg-content2 border border-divider/20 group cursor-pointer"
          onClick={() => actions.handleImageClick(0)}
        >
          <img
            src={images[0]}
            alt="Post content"
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
          />
          {state.imageStats && (
            <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-md text-white/70 text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <AlertCircle size={10} />
              {state.imageStats.views} lượt xem
            </div>
          )}
        </div>
      );
    }

    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-1.5 aspect-video w-full rounded-2xl overflow-hidden cursor-pointer">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative group overflow-hidden"
              onClick={() => actions.handleImageClick(i)}
            >
              <img
                src={img}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      );
    }

    if (count === 3) {
      return (
        <div className="flex flex-col gap-1.5 w-full rounded-2xl overflow-hidden cursor-pointer">
          <div
            className="relative aspect-video group overflow-hidden"
            onClick={() => actions.handleImageClick(0)}
          >
            <img
              src={images[0]}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="grid grid-cols-2 gap-1.5 aspect-[2/1]">
            {images.slice(1, 3).map((img, i) => (
              <div
                key={i + 1}
                className="relative group overflow-hidden"
                onClick={() => actions.handleImageClick(i + 1)}
              >
                <img
                  src={img}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (count === 4) {
      return (
        <div className="flex flex-col gap-1.5 w-full rounded-2xl overflow-hidden cursor-pointer">
          <div className="grid grid-cols-2 gap-1.5 aspect-video">
            {images.slice(0, 2).map((img, i) => (
              <div
                key={i}
                className="relative group overflow-hidden"
                onClick={() => actions.handleImageClick(i)}
              >
                <img
                  src={img}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1.5 aspect-video">
            {images.slice(2, 4).map((img, i) => (
              <div
                key={i + 2}
                className="relative group overflow-hidden"
                onClick={() => actions.handleImageClick(i + 2)}
              >
                <img
                  src={img}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1.5 w-full rounded-2xl overflow-hidden cursor-pointer">
        <div className="grid grid-cols-2 gap-1.5 aspect-[2/1]">
          {images.slice(0, 2).map((img, i) => (
            <div
              key={i}
              className="relative group overflow-hidden"
              onClick={() => actions.handleImageClick(i)}
            >
              <img
                src={img}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1.5 aspect-[3/1]">
          {images.slice(2, 4).map((img, i) => (
            <div
              key={i + 2}
              className="relative group overflow-hidden"
              onClick={() => actions.handleImageClick(i + 2)}
            >
              <img
                src={img}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ))}
          <div
            className="relative group overflow-hidden"
            onClick={() => actions.handleImageClick(4)}
          >
            <img
              src={images[4]}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {count > 5 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                <span className="text-white text-3xl font-black">
                  +{count - 5}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return <div className="w-full px-4 pb-4 relative">{renderGrid()}</div>;
}
