import React from "react";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  online?: boolean;
  className?: string;
}

export function Avatar({ src, name, size = "md", online, className }: AvatarProps) {
  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl",
  };

  const onlineSizes = {
    xs: "w-1.5 h-1.5 -right-0 -bottom-0",
    sm: "w-2 h-2 -right-0.5 -bottom-0.5",
    md: "w-2.5 h-2.5 right-0 bottom-0",
    lg: "w-3 h-3 right-0.5 bottom-0.5",
    xl: "w-4 h-4 right-1 bottom-1",
  };

  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <div
        className={cn(
          sizes[size],
          "rounded-full flex items-center justify-center font-bold overflow-hidden",
          !src && "bg-gradient-to-br from-violet-500 to-indigo-500 text-white"
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          getInitials(name)
        )}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            "absolute rounded-full border-2 border-background",
            onlineSizes[size],
            online ? "bg-emerald-500" : "bg-gray-400"
          )}
        />
      )}
    </div>
  );
}
