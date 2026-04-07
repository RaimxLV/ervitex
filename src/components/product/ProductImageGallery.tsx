import { useState, useEffect } from "react";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
  activeColorImage?: string;
}

const ProductImageGallery = ({ images, alt, activeColorImage }: ProductImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // When a color swatch is clicked, find the matching image or show it as override
  useEffect(() => {
    if (activeColorImage) {
      const idx = images.findIndex((img) => img === activeColorImage);
      if (idx >= 0) {
        setActiveIndex(idx);
      }
    }
  }, [activeColorImage, images]);

  const displayImage = activeColorImage && !images.includes(activeColorImage)
    ? activeColorImage
    : images[activeIndex];

  if (images.length === 0 && !activeColorImage) {
    return (
      <div className="aspect-square overflow-hidden rounded-sm bg-muted flex items-center justify-center text-muted-foreground">
        No image
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="aspect-square overflow-hidden rounded-sm bg-white flex items-center justify-center">
        <img
          src={displayImage || images[0]}
          alt={alt}
          className="h-full w-full object-contain transition-all duration-300"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== "/placeholder.svg") {
              target.src = "/placeholder.svg";
            }
          }}
        />
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`aspect-square overflow-hidden rounded-sm bg-muted ring-2 transition-all ${
                i === activeIndex && !activeColorImage
                  ? "ring-accent"
                  : i === activeIndex && activeColorImage === img
                  ? "ring-accent"
                  : "ring-transparent hover:ring-accent/40"
              }`}
            >
              <img
                src={img}
                alt=""
                className="h-full w-full object-contain bg-white"
                loading="lazy"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== "/placeholder.svg") {
                    target.src = "/placeholder.svg";
                  }
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
