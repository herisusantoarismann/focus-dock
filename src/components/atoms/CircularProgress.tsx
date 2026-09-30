"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CircularProgressProps {
    progress: number; // 0 to 1
    size?: number; // diameter in px (default 280)
    strokeWidth?: number; // ring thickness in px (default 10)
    variant?: "emerald" | "amber" | "slate";
    children?: React.ReactNode;
    className?: string;
}

export function CircularProgress({
    progress,
    size = 280,
    strokeWidth = 10,
    variant = "emerald",
    children,
    className,
}: CircularProgressProps) {
    // Clamp progress between 0 and 1
    const clampedProgress = Math.max(
        0,
        Math.min(1, isNaN(progress) ? 0 : progress),
    );

    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    // Formula from AGENTS.md: strokeDashoffset = circumference - (progress * circumference)
    const strokeDashoffset = circumference - clampedProgress * circumference;

    const strokeColors = {
        emerald:
            "stroke-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]",
        amber: "stroke-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]",
        slate: "stroke-slate-400 drop-shadow-[0_0_12px_rgba(148,163,184,0.35)]",
    };

    return (
        <div
            className={twMerge(
                clsx(
                    "relative flex items-center justify-center select-none w-full aspect-square mx-auto",
                    className,
                ),
            )}
            style={{ maxWidth: size, maxHeight: size }}
        >
            <svg
                className="w-full h-full -rotate-90 transform"
                viewBox={`0 0 ${size} ${size}`}
            >
                {/* Background Track */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    className="stroke-zinc-800/80 fill-transparent"
                    strokeWidth={strokeWidth}
                />
                {/* Animated Progress Ring */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    className={clsx(
                        "fill-transparent transition-[stroke-dashoffset] duration-500 ease-linear",
                        strokeColors[variant],
                    )}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                />
            </svg>
            {/* Centered content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto p-4">
                {children}
            </div>
        </div>
    );
}
