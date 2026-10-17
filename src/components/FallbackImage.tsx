"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { isProductImageProxy, productImageLoader } from "@/lib/product-image-loader";

type FallbackImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
  fallbackSrc?: string;
};

export default function FallbackImage(props: FallbackImageProps) {
  return <FallbackImageSource key={props.src || props.fallbackSrc || "/embreve.jpg"} {...props} />;
}

function FallbackImageSource({
  src,
  fallbackSrc = "/embreve.jpg",
  alt,
  onError,
  ...props
}: FallbackImageProps) {
  const normalizedSrc = src || fallbackSrc;
  const [currentSrc, setCurrentSrc] = useState(normalizedSrc);

  return (
    <Image
      {...props}
      loader={isProductImageProxy(currentSrc) ? productImageLoader : props.loader}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        onError?.(event);
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
