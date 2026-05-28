import React from "react";
import Image from "next/image";
import { BWLLogoProps } from "../../types/bwl-logo";

export const BWLLogo: React.FC<BWLLogoProps> = ({
  className = "",
  size = 32,
  useGradient = false,
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <Image
          src="/assets/images/mezon.webp"
          alt="BWL Logo"
          fill
          sizes={`${size}px`}
          className="object-contain"
          priority
        />
      </div>

      <div className="flex flex-col leading-none text-left select-none">
        <span className="text-[25px] font-black tracking-tight text-foreground">
          BWL
        </span>
        <span
          className={`text-[9.5px] font-extrabold tracking-[0.35em] uppercase mt-0.5 ${
            useGradient ? "text-brand-start" : "text-zinc-500"
          }`}
        >
          Social
        </span>
      </div>
    </div>
  );
};
