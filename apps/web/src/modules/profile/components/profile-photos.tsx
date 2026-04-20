"use client";

interface ProfilePhotosProps {
  images: string[];
}

export function ProfilePhotos({ images }: ProfilePhotosProps) {
  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-content1/50 rounded-2xl border border-dashed border-divider">
        <p>Người dùng này chưa có ảnh nào.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 overflow-hidden rounded-2xl">
      {images.map((img, index) => {
        const isFeatured = index === 0;

        return (
          <div
            key={`${img}-${index}`}
            className={`relative group cursor-pointer overflow-hidden rounded-2xl border border-divider/10 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20 ${
              isFeatured
                ? "col-span-2 row-span-2 aspect-[4/5] md:aspect-auto"
                : "col-span-1 aspect-square md:aspect-[3/4]"
            }`}
          >
            <img
              src={img}
              alt={`User photo ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <div className="w-full h-px bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
