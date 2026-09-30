"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SessionMode } from "@/types/focus";

export interface BadgeProps {
    mode?: SessionMode | "focus" | "break" | "idle";
    variant?: "emerald" | "amber" | "slate";
    children: React.ReactNode;
    className?: string;
    size?: "sm" | "md";
}

export function Badge({
    mode,
    variant,
    children,
    className,
    size = "md",
}: BadgeProps) {
    // Determine variant based on mode if not explicitly provided
    let effectiveVariant = variant;
    if (!effectiveVariant && mode) {
        if (mode === "focus") {
            effectiveVariant = "emerald";
        } else if (
            mode === "shortBreak" ||
            mode === "longBreak" ||
            mode === "break"
        ) {
            effectiveVariant = "amber";
        } else {
            effectiveVariant = "slate";
        }
    }

    const baseStyles =
        "inline-flex items-center gap-1.5 font-medium rounded-full transition-colors select-none";

    const sizeStyles = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs tracking-wide uppercase font-semibold",
    };

    const variantStyles = {
        emerald:
            "bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
        amber: "bg-amber-950/70 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]",
        slate: "bg-slate-800/80 text-slate-300 border border-slate-700",
    };

    return (
        <span
            className={twMerge(
                clsx(
                    baseStyles,
                    sizeStyles[size],
                    variantStyles[effectiveVariant ?? "slate"],
                    className,
                ),
            )}
        >
            <span
                className={clsx(
                    "w-1.5 h-1.5 rounded-full animate-pulse",
                    effectiveVariant === "emerald" && "bg-emerald-400",
                    effectiveVariant === "amber" && "bg-amber-400",
                    (!effectiveVariant || effectiveVariant === "slate") &&
                        "bg-slate-400",
                )}
            />
            {children}
        </span>
    );
}
