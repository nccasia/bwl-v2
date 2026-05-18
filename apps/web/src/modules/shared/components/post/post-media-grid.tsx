"use client";

import { usePostMediaGrid } from "@/modules/shared/hooks/image-viewer/use-post-media-grid";
import type { ImageViewerPost } from "@/types/image-viewer";

export interface PostMediaGridProps {
  post: ImageViewerPost;
}

export function PostMediaGrid({ post }: PostMediaGridProps) {
  const images = post?.images || [];
  const { actions } = usePostMediaGrid(post);

  if (!images || images.length === 0) return null;

  const renderGrid = () => {
    const count = images.length;

    if (count === 1) {
      return (
        <div
          className="relative w-full overflow-hidden bg-content group cursor-pointer"
          onClick={() => actions.handleImageClick(0)}
        >
          <img
            src={images[0]}
            alt="Post content"
            className="mx-auto h-auto transition-transform duration-500 group-hover:scale-[1.02]"
          />
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

  return <div className="w-full pb-4 relative">{renderGrid()}</div>;
}
