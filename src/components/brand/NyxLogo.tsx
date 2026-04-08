import Image from "next/image";
import type { CSSProperties } from "react";

type NyxLogoProps = {
  size: number;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
};

export function NyxLogo({ size, alt = "NyxAegis", className, style, priority = false }: NyxLogoProps) {
  return (
    <Image
      src="/Aegislogo.png"
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={className}
      style={{ objectFit: "contain", display: "block", ...style }}
    />
  );
}
