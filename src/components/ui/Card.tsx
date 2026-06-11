import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "glass" | "solid" | "outline";
}

export function Card({
  children,
  className,
  hover = false,
  onClick,
  padding = "md",
  variant = "glass",
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
  };

  const variants = {
    glass: "glass-card rounded-2xl",
    solid: "bg-card border border-border rounded-2xl shadow-sm",
    outline: "border border-white/15 dark:border-white/8 rounded-2xl",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        variants[variant],
        paddings[padding],
        hover && "card-hover cursor-pointer",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("font-semibold text-foreground leading-tight", className)}>
      {children}
    </h3>
  );
}
