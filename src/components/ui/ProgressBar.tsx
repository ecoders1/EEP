"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: "violet" | "emerald" | "amber" | "blue" | "rose";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = false,
  color = "violet",
  size = "md",
  animated = true,
  className,
}: ProgressBarProps) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  useEffect(() => {
    if (!animated) {
      setWidth(percentage);
      return;
    }
    const timer = setTimeout(() => setWidth(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage, animated]);

  const colors = {
    violet: "from-violet-500 to-indigo-500",
    emerald: "from-emerald-500 to-teal-500",
    amber: "from-amber-500 to-orange-500",
    blue: "from-blue-500 to-cyan-500",
    rose: "from-rose-500 to-pink-500",
  };

  const bgColors = {
    violet: "bg-violet-500/20",
    emerald: "bg-emerald-500/20",
    amber: "bg-amber-500/20",
    blue: "bg-blue-500/20",
    rose: "bg-rose-500/20",
  };

  const heights = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full", className)} ref={ref}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-foreground/80">{label}</span>
          )}
          {showPercent && (
            <span className="text-sm font-bold text-foreground">{percentage}%</span>
          )}
        </div>
      )}
      <div className={cn("w-full rounded-full overflow-hidden", bgColors[color], heights[size])}>
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out",
            colors[color]
          )}
          style={{ width: `${width}%` }}
        >
          {size === "lg" && (
            <div className="h-full w-full shimmer opacity-50" />
          )}
        </div>
      </div>
    </div>
  );
}
