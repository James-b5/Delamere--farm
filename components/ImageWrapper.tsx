"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageWrapperProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export default function ImageWrapper({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "",
  priority = false,
  sizes,
}: ImageWrapperProps) {
  const [isError, setIsError] = useState(false);

  // If there's an error or no src, show placeholder
  if (isError || !src) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className} ${!fill ? '' : 'w-full h-full'}`}
        {...(!fill && width && height && { style: { width, height } })}
      >
        <span className="text-gray-400 text-sm px-4 text-center">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${className} ${fill ? 'w-full h-full' : ''}`}>
      <Image
        src={encodeURI(src)}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={fill ? (sizes ?? '288px') : sizes}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        onError={() => setIsError(true)}
        className="object-cover"
      />
    </div>
  );
}
