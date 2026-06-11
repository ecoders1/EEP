import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info" | "gold";
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "sm",
  dot = false,
  className,
}: BadgeProps) {
  const variants = {
    default:
      "bg-violet-500/20 text-violet-400 dark:text-violet-300 border border-violet-500/30",
    success:
      "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30",
    warning:
      "bg-amber-500/20 text-amber-500 border border-amber-500/30",
    error:
      "bg-red-500/20 text-red-500 border border-red-500/30",
    info:
      "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    gold:
      "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  const dotColors = {
    default: "bg-violet-400",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    info: "bg-blue-400",
    gold: "bg-amber-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])} />
      )}
      {children}
    </span>
  );
}
