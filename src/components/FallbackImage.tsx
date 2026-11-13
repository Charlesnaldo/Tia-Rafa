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
  onLoad,
  className,
  ...props
}: FallbackImageProps) {
  const normalizedSrc = src || fallbackSrc;
  const [currentSrc, setCurrentSrc] = useState(normalizedSrc);
  const [settled, setSettled] = useState(false);

  return (
    <Image
      {...props}
      className={`${className || ""}${settled ? "" : " image-skeleton"}`}
      unoptimized={props.unoptimized || (process.env.NODE_ENV === "development" && currentSrc.startsWith("https://www.tiarafaela.com.br/"))}
      loader={isProductImageProxy(currentSrc) ? productImageLoader : props.loader}
      src={currentSrc}
      alt={alt}
      onLoad={(event) => {
        setSettled(true);
        onLoad?.(event);
      }}
      onError={(event) => {
        onError?.(event);
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
          setSettled(false);
        } else {
          setSettled(true);
        }
      }}
    />
  );
}
