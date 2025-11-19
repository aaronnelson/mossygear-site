"use client";

import { useState } from "react";
import Image from "next/image";
import { urlForImage } from "@/lib/sanityImage";

type ProductGalleryProps = {
  images: any[];
  title: string;
};

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const hasImages = images && images.length > 0;
  const [activeIndex, setActiveIndex] = useState(0);

  const mainImage = hasImages ? images[activeIndex] : null;

  return (
    <div>
      {/* Main image */}
      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-background/60 border border-foreground/15 mb-3">
        {mainImage ? (
          <Image
            src={urlForImage(mainImage).width(900).height(675).url()}
            alt={title}
            width={900}
            height={675}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground/60 text-sm">
            No image yet
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {hasImages && images.length > 1 && (
        <div className="flex gap-2">
          {images.slice(0, 6).map((img, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={[
                  "w-20 h-20 rounded-xl overflow-hidden bg-background/60 border",
                  isActive
                    ? "border-accent"
                    : "border-foreground/20 hover:border-foreground/60",
                ].join(" ")}
              >
                <Image
                  src={urlForImage(img).width(200).height(200).url()}
                  alt={`${title} thumbnail ${idx + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
