"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface SliderProps {
    value: number; // 0 to 1
    onChange: (value: number) => void;
    disabled?: boolean;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
    ariaLabel?: string;
}

export function Slider({
    value,
    onChange,
    disabled = false,
    min = 0,
    max = 1,
    step = 0.01,
    className,
    ariaLabel = "Volume Slider",
}: SliderProps) {
    const percentage = Math.max(
        0,
        Math.min(100, Math.round(((value - min) / (max - min)) * 100)),
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        onChange(isNaN(val) ? 0 : val);
    };

    return (
        <div
            className={twMerge(
                clsx(
                    "relative flex items-center w-full select-none",
                    className,
                ),
            )}
        >
            <div className="relative w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                {/* Filled active track */}
                <div
                    className={clsx(
                        "h-full rounded-full transition-all duration-75",
                        disabled
                            ? "bg-slate-600"
                            : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]",
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                disabled={disabled}
                aria-label={ariaLabel}
                className={clsx(
                    "absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed",
                    "touch-none",
                )}
            />
        </div>
    );
}
