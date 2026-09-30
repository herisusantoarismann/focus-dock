"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "outline" | "ghost" | "danger" | "emerald" | "amber";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
}

export function Button({
    variant = "primary",
    size = "md",
    isLoading = false,
    className,
    disabled,
    children,
    ...props
}: ButtonProps) {
    const baseStyles =
        "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.97] select-none";

    const sizeStyles = {
        sm: "px-3 py-1.5 text-xs gap-1.5",
        md: "px-4 py-2 text-sm gap-2",
        lg: "px-6 py-3 text-base gap-2.5 font-semibold",
        icon: "p-2.5 h-10 w-10 text-sm",
    };

    const variantStyles = {
        primary:
            "bg-slate-100 text-zinc-950 hover:bg-white active:bg-slate-200 focus-visible:ring-slate-400 font-semibold shadow-md shadow-black/20",
        emerald:
            "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 active:bg-emerald-600 focus-visible:ring-emerald-400 font-semibold shadow-lg shadow-emerald-500/20",
        amber: "bg-amber-500 text-zinc-950 hover:bg-amber-400 active:bg-amber-600 focus-visible:ring-amber-400 font-semibold shadow-lg shadow-amber-500/20",
        outline:
            "border border-slate-700/80 bg-zinc-900/60 text-slate-200 hover:bg-zinc-800 hover:text-white active:bg-zinc-700 focus-visible:ring-slate-500",
        ghost: "bg-transparent text-slate-400 hover:text-slate-100 hover:bg-zinc-800/60 active:bg-zinc-800 focus-visible:ring-slate-500",
        danger: "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:text-red-300 active:bg-red-500/30 focus-visible:ring-red-400",
    };

    return (
        <button
            className={twMerge(
                clsx(
                    baseStyles,
                    sizeStyles[size],
                    variantStyles[variant],
                    className,
                ),
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : null}
            {children}
        </button>
    );
}
