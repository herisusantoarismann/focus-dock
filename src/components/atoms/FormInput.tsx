"use client";

import React, { forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { X } from "lucide-react";

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    onClear?: () => void;
    showClearButton?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    (
        {
            label,
            error,
            className,
            value,
            onChange,
            onClear,
            showClearButton = true,
            disabled,
            ...props
        },
        ref,
    ) => {
        const hasValue = Boolean(value && String(value).length > 0);

        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label ? (
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        {label}
                    </label>
                ) : null}
                <div className="relative flex items-center w-full">
                    <input
                        ref={ref}
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                        className={twMerge(
                            clsx(
                                "w-full bg-zinc-900/90 text-slate-100 placeholder:text-slate-500 rounded-xl px-4 py-2.5 text-sm transition-all duration-150 border border-slate-800 shadow-inner",
                                "focus:outline-none focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20",
                                "disabled:opacity-55 disabled:cursor-not-allowed disabled:bg-zinc-950/70",
                                error &&
                                    "border-red-500/80 focus:ring-red-500/20 focus:border-red-500",
                                showClearButton && hasValue && !disabled
                                    ? "pr-10"
                                    : "",
                                className,
                            ),
                        )}
                        {...props}
                    />
                    {showClearButton && hasValue && !disabled && onClear ? (
                        <button
                            type="button"
                            onClick={onClear}
                            className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-zinc-800 transition-colors focus:outline-none"
                            aria-label="Clear input"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    ) : null}
                </div>
                {error ? (
                    <span className="text-xs text-red-400 font-medium">
                        {error}
                    </span>
                ) : null}
            </div>
        );
    },
);

FormInput.displayName = "FormInput";
