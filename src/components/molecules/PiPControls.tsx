"use client";

import React from "react";
import { Play, Pause, CheckCircle2, SkipForward } from "lucide-react";
import { TimerStatus, SessionMode } from "@/types/focus";
import { clsx } from "clsx";

export interface PiPControlsProps {
    status: TimerStatus;
    mode: SessionMode;
    onTogglePlayPause: () => void;
    onComplete: () => void;
    onSkip: () => void;
    isPlayDisabled?: boolean;
}

export function PiPControls({
    status,
    mode,
    onTogglePlayPause,
    onComplete,
    onSkip,
    isPlayDisabled = false,
}: PiPControlsProps) {
    const isRunning = status === "running";
    const isFocus = mode === "focus";

    return (
        <div className="flex items-center justify-center gap-2 select-none">
            {/* Play / Pause Button */}
            <button
                type="button"
                onClick={onTogglePlayPause}
                disabled={isPlayDisabled}
                className={clsx(
                    "flex items-center justify-center w-8 h-8 rounded-lg active:scale-95 transition-all shadow-sm",
                    isFocus
                        ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                        : "bg-amber-500 text-zinc-950 hover:bg-amber-400",
                    !isFocus &&
                        !isRunning &&
                        "ring-2 ring-amber-400/70 animate-pulse",
                    "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-500",
                )}
                aria-label={
                    isRunning
                        ? "Pause timer"
                        : isFocus
                          ? "Start timer"
                          : "Start break timer"
                }
                title={
                    isPlayDisabled
                        ? "Set focus intent in main window to start"
                        : isRunning
                          ? "Pause timer"
                          : isFocus
                            ? "Start focus timer"
                            : "Start break timer"
                }
            >
                {isRunning ? (
                    <Pause className="w-4 h-4 fill-current" />
                ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
            </button>

            {/* Complete Early (in focus) or Skip Break */}
            {isFocus ? (
                <button
                    type="button"
                    onClick={onComplete}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 text-slate-200 hover:text-emerald-400 hover:bg-zinc-700 active:scale-95 transition-all border border-slate-700/60"
                    aria-label="Complete task early"
                    title="Complete task early (Ctrl+Enter)"
                >
                    <CheckCircle2 className="w-4 h-4" />
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onSkip}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 text-amber-300 hover:bg-zinc-700 active:scale-95 transition-all border border-amber-500/40"
                    aria-label="Skip break"
                    title="Skip break"
                >
                    <SkipForward className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
