"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/atoms/Button";
import { Eye, Coffee, ArrowRight } from "lucide-react";
import { clsx } from "clsx";

export interface MicroBreakCardProps {
    onSkip: () => void;
    mode: "shortBreak" | "longBreak";
    className?: string;
}

export function MicroBreakCard({
    onSkip,
    mode,
    className,
}: MicroBreakCardProps) {
    // Disables "Skip" button for 5 seconds using local countdown state
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const isSkipDisabled = countdown > 0;

    return (
        <div
            className={clsx(
                "flex flex-col gap-3 p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90 shadow-lg shadow-amber-950/10",
                className,
            )}
        >
            <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                    {mode === "longBreak" ? (
                        <Coffee className="w-5 h-5" />
                    ) : (
                        <Eye className="w-5 h-5" />
                    )}
                </div>
                <div className="flex flex-col gap-1 flex-1">
                    <h4 className="text-sm font-semibold text-amber-300">
                        {mode === "longBreak"
                            ? "Long Rest: Step away from screens"
                            : "20-20-20 Rest Protocol"}
                    </h4>
                    <p className="text-xs text-amber-200/70 leading-relaxed">
                        {mode === "longBreak"
                            ? "Great stamina! You completed 4 pomodoros. Stretch, drink water, walk around, or rest your posture."
                            : "Look at an object at least 20 feet (6 meters) away for 20 seconds to reset ciliary eye muscles."}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-amber-500/20 mt-1">
                <span className="text-[11px] text-amber-300/60 font-mono">
                    {isSkipDisabled
                        ? `Rest unlocked in ${countdown}s`
                        : "Break ready to resume"}
                </span>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onSkip}
                    disabled={isSkipDisabled}
                    className="text-xs border-amber-500/40 hover:bg-amber-500/20 text-amber-300"
                >
                    <span>
                        {isSkipDisabled ? `Wait (${countdown}s)` : "Skip Break"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
            </div>
        </div>
    );
}
