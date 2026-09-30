"use client";

import React, { useRef, useEffect } from "react";
import { FormInput } from "@/components/atoms/FormInput";
import { useFocusStore } from "@/stores/useFocusStore";
import { Lock, Target, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

export interface IntentInputBarProps {
    onStartSession?: () => void;
    hasError?: boolean;
    errorMessage?: string;
    className?: string;
}

export function IntentInputBar({
    onStartSession,
    hasError = false,
    errorMessage,
    className,
}: IntentInputBarProps) {
    const currentIntent = useFocusStore((state) => state.currentIntent);
    const setIntent = useFocusStore((state) => state.setIntent);
    const status = useFocusStore((state) => state.status);
    const inputRef = useRef<HTMLInputElement>(null);

    const isLocked = status === "running";

    // Focus input automatically if hasError triggers
    useEffect(() => {
        if (hasError && !isLocked) {
            inputRef.current?.focus();
        }
    }, [hasError, isLocked]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            inputRef.current?.blur();
            if (status === "idle" && onStartSession) {
                onStartSession();
            }
        }
    };

    return (
        <div className={clsx("flex flex-col gap-2 w-full", className)}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <Target
                        className={clsx(
                            "w-3.5 h-3.5",
                            hasError
                                ? "text-red-400 animate-bounce"
                                : "text-emerald-400",
                        )}
                    />
                    <span>Active Focus Intent</span>
                </label>
                {isLocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400/90 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/20">
                        <Lock className="w-3 h-3" />
                        Locked during session
                    </span>
                ) : (
                    <span className="text-[11px] text-slate-400 font-mono">
                        Press{" "}
                        <kbd className="px-1 py-0.5 bg-zinc-800 rounded border border-slate-700 text-slate-300">
                            Enter
                        </kbd>{" "}
                        to lock in
                    </span>
                )}
            </div>

            <FormInput
                ref={inputRef}
                value={currentIntent}
                onChange={(e) => setIntent(e.target.value)}
                onClear={() => setIntent("")}
                disabled={isLocked}
                placeholder={
                    isLocked
                        ? "Current intent is locked"
                        : "What is your single focus intent? (e.g. Finish auth refactor)"
                }
                onKeyDown={handleKeyDown}
                className={clsx(
                    isLocked &&
                        "border-slate-800 bg-zinc-950/80 font-medium text-emerald-300",
                    hasError &&
                        "border-red-500 ring-2 ring-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.25)] transition-all animate-pulse",
                )}
            />

            {hasError ? (
                <span className="flex items-center gap-1.5 text-xs text-red-400 font-medium animate-in fade-in slide-in-from-top-1 duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errorMessage ||
                        "Focus intent is required to start your session."}
                </span>
            ) : null}
        </div>
    );
}
