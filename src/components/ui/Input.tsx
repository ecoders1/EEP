"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  variant?: "glass" | "default";
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconClick,
  variant = "glass",
  className,
  id,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).slice(2)}`;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground/80"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "w-full h-12 rounded-xl text-sm text-foreground placeholder:text-foreground/30",
            "transition-all duration-200 outline-none",
            leftIcon ? "pl-10" : "pl-4",
            rightIcon ? "pr-10" : "pr-4",
            variant === "glass"
              ? [
                  "glass-card",
                  focused
                    ? "ring-2 ring-violet-500/60 border-violet-500/40"
                    : "hover:border-white/30",
                  error ? "ring-2 ring-red-500/60 border-red-500/40" : "",
                ]
              : [
                  "bg-secondary border border-border",
                  focused ? "ring-2 ring-violet-500/60 border-violet-500" : "",
                  error ? "ring-2 ring-red-500/60 border-red-500" : "",
                ],
            className
          )}
          {...props}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70 transition-colors"
          >
            {rightIcon}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 flex items-center gap-1">{error}</p>}
      {hint && !error && <p className="text-xs text-foreground/50">{hint}</p>}
    </div>
  );
}
