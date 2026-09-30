"use client";

import React, { useState } from "react";
import { useFocusStore } from "@/stores/useFocusStore";
import { formatTime } from "@/lib/timeUtils";
import { CircularProgress } from "@/components/atoms/CircularProgress";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { IntentInputBar } from "@/components/molecules/IntentInputBar";
import { MicroBreakCard } from "@/components/molecules/MicroBreakCard";
import {
    Play,
    Pause,
    RotateCcw,
    CheckCircle2,
    PictureInPicture2,
    Flame,
    Coffee,
} from "lucide-react";
import confetti from "canvas-confetti";

export interface TimerWorkspaceProps {
    onTogglePip?: () => void;
    onInteractAudio?: () => void;
    isPipOpen?: boolean;
    isPipSupported?: boolean;
}

export function TimerWorkspace({
    onTogglePip,
    onInteractAudio,
    isPipOpen = false,
    isPipSupported = false,
}: TimerWorkspaceProps) {
    const status = useFocusStore((state) => state.status);
    const mode = useFocusStore((state) => state.mode);
    const timeLeft = useFocusStore((state) => state.timeLeft);
    const settings = useFocusStore((state) => state.settings);
    const completedPomodoros = useFocusStore(
        (state) => state.completedPomodoros,
    );
    const currentIntent = useFocusStore((state) => state.currentIntent);

    const startTimer = useFocusStore((state) => state.startTimer);
    const pauseTimer = useFocusStore((state) => state.pauseTimer);
    const resetTimer = useFocusStore((state) => state.resetTimer);
    const completeSession = useFocusStore((state) => state.completeSession);
    const skipBreak = useFocusStore((state) => state.skipBreak);

    const [hasIntentAttempt, setHasIntentAttempt] = useState(false);

    const isRunning = status === "running";
    const isFocus = mode === "focus";
    const isIntentMissing = isFocus && !currentIntent.trim();
    const hasError = hasIntentAttempt && isIntentMissing;

    // Trigger celebratory confetti burst upon entering break mode
    React.useEffect(() => {
        if (mode === "shortBreak" || mode === "longBreak") {
            try {
                void confetti({
                    particleCount: 65,
                    spread: 70,
                    origin: { y: 0.65 },
                });
            } catch {
                // Ignore if confetti not supported
            }
        }
    }, [mode]);

    // Calculate total duration for current session mode
    const totalDuration = isFocus
        ? settings.focusDuration
        : mode === "shortBreak"
          ? settings.shortBreakDuration
          : settings.longBreakDuration;

    // Progress fraction (1 at start, 0 when completed)
    const progress = totalDuration > 0 ? timeLeft / totalDuration : 0;

    const handleStartPause = () => {
        if (isRunning) {
            pauseTimer();
        } else {
            if (isIntentMissing) {
                setHasIntentAttempt(true);
                setTimeout(() => setHasIntentAttempt(false), 3500);
                return;
            }
            setHasIntentAttempt(false);
            onInteractAudio?.();
            startTimer();
        }
    };

    const handleCompleteEarly = () => {
        try {
            void confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
            });
        } catch {
            // Ignored if canvas-confetti is not available
        }
        completeSession();
    };

    const badgeText = isFocus
        ? "Focus Session"
        : mode === "shortBreak"
          ? "Short Break"
          : "Long Break";

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
            {/* Top Header: Mode Badge + Pomodoro counter */}
            <div className="flex items-center justify-between w-full px-1 sm:px-2 gap-2 flex-wrap sm:flex-nowrap">
                <Badge mode={mode}>{badgeText}</Badge>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-zinc-900/80 px-2.5 sm:px-3 py-1 rounded-full border border-slate-800 shrink-0">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cycle:</span>
                    <span className="text-emerald-400 font-mono">
                        {completedPomodoros % 4} / 4
                    </span>
                    <span className="text-slate-500 text-[10px]">
                        ({completedPomodoros} total)
                    </span>
                </div>
            </div>

            {/* Break Celebratory Announcement Banner */}
            {!isFocus && (
                <div className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 shadow-lg shadow-amber-950/20 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                            <Coffee className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="flex flex-col min-w-0 pr-1">
                            <span className="text-xs sm:text-sm font-bold text-amber-300 truncate">
                                🎉 Focus Complete! Time to Recharge.
                            </span>
                            <span className="text-[11px] sm:text-xs text-amber-200/70">
                                {status === "idle"
                                    ? "Click Start to begin rest countdown, or follow guide below."
                                    : "Rest timer is currently active."}
                            </span>
                        </div>
                    </div>

                    {status === "idle" ? (
                        <Button
                            variant="amber"
                            size="sm"
                            onClick={handleStartPause}
                            className="shrink-0 text-xs shadow-md font-semibold"
                        >
                            <Play className="w-3.5 h-3.5 mr-1 fill-current" />
                            <span>Start Break</span>
                        </Button>
                    ) : null}
                </div>
            )}

            {/* Center: Circular Progress Dial */}
            <div className="relative my-2 w-full flex justify-center">
                <CircularProgress
                    progress={progress}
                    size={300}
                    strokeWidth={12}
                    variant={isFocus ? "emerald" : "amber"}
                >
                    <div className="flex flex-col items-center justify-center gap-1 text-center">
                        <span className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-slate-100 drop-shadow-sm select-none">
                            {formatTime(timeLeft)}
                        </span>
                        <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">
                            {status === "running"
                                ? "In Progress"
                                : status === "paused"
                                  ? "Paused"
                                  : "Ready"}
                        </span>
                    </div>
                </CircularProgress>
            </div>

            {/* Control Buttons Bar */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 w-full flex-wrap sm:flex-nowrap">
                {/* Reset */}
                <Button
                    variant="outline"
                    size="md"
                    onClick={resetTimer}
                    title="Reset Timer"
                    aria-label="Reset Timer"
                >
                    <RotateCcw className="w-4 h-4" />
                </Button>

                {/* Primary Start / Pause */}
                <div
                    className="relative"
                    title={
                        !isRunning && isIntentMissing
                            ? "Enter your focus intent below to start"
                            : isRunning
                              ? "Pause session"
                              : "Start session"
                    }
                    onClick={() => {
                        if (!isRunning && isIntentMissing) {
                            setHasIntentAttempt(true);
                            setTimeout(() => setHasIntentAttempt(false), 3500);
                        }
                    }}
                >
                    <Button
                        variant={isFocus ? "emerald" : "amber"}
                        size="lg"
                        onClick={handleStartPause}
                        disabled={!isRunning && isIntentMissing}
                        className="min-w-[120px] sm:min-w-[140px]"
                    >
                        {isRunning ? (
                            <>
                                <Pause className="w-5 h-5 fill-current" />
                                <span>Pause</span>
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                                <span>
                                    {status === "paused" ? "Resume" : "Start"}
                                </span>
                            </>
                        )}
                    </Button>
                </div>

                {/* Complete early (if focus) or Skip (if break) */}
                {isFocus ? (
                    <Button
                        variant="outline"
                        size="md"
                        onClick={handleCompleteEarly}
                        disabled={
                            status === "idle" &&
                            timeLeft === settings.focusDuration
                        }
                        title="Complete Early (Ctrl+Enter)"
                        aria-label="Complete Early"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        size="md"
                        onClick={skipBreak}
                        title="Skip Break"
                        aria-label="Skip Break"
                    >
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    </Button>
                )}

                {/* PiP Button */}
                {isPipSupported && onTogglePip ? (
                    <Button
                        variant={isPipOpen ? "emerald" : "outline"}
                        size="md"
                        onClick={onTogglePip}
                        title="Toggle Picture-in-Picture (Alt+P)"
                        aria-label="Toggle Picture-in-Picture"
                    >
                        <PictureInPicture2 className="w-4 h-4" />
                    </Button>
                ) : null}
            </div>

            {/* Shortcut hint */}
            <div className="text-[11px] text-slate-400 font-mono flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-center">
                <span>
                    <kbd className="px-1 py-0.5 bg-zinc-800 rounded border border-slate-700 text-slate-300">
                        Space
                    </kbd>{" "}
                    Play/Pause
                </span>
                <span>•</span>
                <span>
                    <kbd className="px-1 py-0.5 bg-zinc-800 rounded border border-slate-700 text-slate-300">
                        Alt+P
                    </kbd>{" "}
                    PiP
                </span>
            </div>

            {/* Active Intent Input Bar (During Focus) or MicroBreakCard (During Break) */}
            <div className="w-full mt-2">
                {isFocus ? (
                    <IntentInputBar
                        onStartSession={handleStartPause}
                        hasError={hasError}
                        errorMessage="Please specify your focus intent before starting the timer."
                    />
                ) : (
                    <MicroBreakCard
                        key={mode}
                        mode={mode as "shortBreak" | "longBreak"}
                        onSkip={skipBreak}
                    />
                )}
            </div>
        </div>
    );
}
