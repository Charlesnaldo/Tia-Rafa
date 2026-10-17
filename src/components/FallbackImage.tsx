"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

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
