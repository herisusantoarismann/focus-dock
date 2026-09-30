"use client";

import React from "react";
import { useFocusStore } from "@/stores/useFocusStore";
import { formatTime } from "@/lib/timeUtils";
import { PiPControls } from "@/components/molecules/PiPControls";
import { clsx } from "clsx";

export function FloatingPipView() {
    const status = useFocusStore((state) => state.status);
    const mode = useFocusStore((state) => state.mode);
    const timeLeft = useFocusStore((state) => state.timeLeft);
    const currentIntent = useFocusStore((state) => state.currentIntent);
    const settings = useFocusStore((state) => state.settings);

    const startTimer = useFocusStore((state) => state.startTimer);
    const pauseTimer = useFocusStore((state) => state.pauseTimer);
    const completeSession = useFocusStore((state) => state.completeSession);
    const skipBreak = useFocusStore((state) => state.skipBreak);

    const isRunning = status === "running";
    const isFocus = mode === "focus";
    const isIntentMissing = isFocus && !currentIntent.trim();
    const isPlayDisabled = !isRunning && isIntentMissing;

    const totalDuration = isFocus
        ? settings.focusDuration
        : mode === "shortBreak"
          ? settings.shortBreakDuration
          : settings.longBreakDuration;

    const progress = totalDuration > 0 ? (timeLeft / totalDuration) * 100 : 0;

    const handleTogglePlayPause = () => {
        if (isRunning) {
            pauseTimer();
        } else {
            if (isIntentMissing) return;
            startTimer();
        }
    };

    return (
        <div
            className={clsx(
                "flex flex-col justify-between w-full h-full min-h-[160px] p-3 font-sans select-none box-border transition-colors duration-500",
                isFocus
                    ? "bg-zinc-950 text-slate-100"
                    : "bg-gradient-to-b from-amber-950/40 via-zinc-950 to-zinc-950 text-slate-100",
            )}
        >
            {/* Top Header */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 truncate">
                    <span
                        className={clsx(
                            "w-2 h-2 rounded-full shrink-0",
                            isRunning && "animate-pulse",
                            isIntentMissing
                                ? "bg-red-400"
                                : isFocus
                                  ? "bg-emerald-400"
                                  : "bg-amber-400",
                        )}
                    />
                    <span
                        className={clsx(
                            "text-xs font-semibold truncate",
                            isIntentMissing
                                ? "text-red-400"
                                : !isFocus
                                  ? "text-amber-200"
                                  : "text-slate-200",
                        )}
                    >
                        {isFocus
                            ? currentIntent.trim() || "⚠️ Set intent to start"
                            : status === "idle"
                              ? "🎉 Focus Done! Time to rest"
                              : mode === "shortBreak"
                                ? "☕ Short Break"
                                : "☕ Long Break"}
                    </span>
                </div>

                <span
                    className={clsx(
                        "text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded border shrink-0",
                        isFocus
                            ? "text-emerald-400 border-emerald-500/30 bg-emerald-950/60"
                            : "text-amber-400 border-amber-500/30 bg-amber-950/60",
                    )}
                >
                    {isFocus ? "Focus" : "Break"}
                </span>
            </div>

            {/* Main Countdown Time */}
            <div className="flex flex-col items-center justify-center my-0.5">
                <span className="text-4xl font-extrabold font-mono tracking-tight text-white drop-shadow-sm leading-none">
                    {formatTime(timeLeft)}
                </span>
                {!isFocus && (
                    <span className="text-[10px] font-medium text-amber-300 mt-1">
                        {status === "idle"
                            ? "Press ▶ to start break"
                            : "Rest your eyes & stretch"}
                    </span>
                )}
            </div>

            {/* Progress Track */}
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden my-1">
                <div
                    className={clsx(
                        "h-full transition-all duration-300",
                        isFocus ? "bg-emerald-500" : "bg-amber-500",
                    )}
                    style={{
                        width: `${Math.max(0, Math.min(100, progress))}%`,
                    }}
                />
            </div>

            {/* Bottom Minified Controls */}
            <div className="mt-0.5">
                <PiPControls
                    status={status}
                    mode={mode}
                    onTogglePlayPause={handleTogglePlayPause}
                    onComplete={completeSession}
                    onSkip={skipBreak}
                    isPlayDisabled={isPlayDisabled}
                />
            </div>
        </div>
    );
}
