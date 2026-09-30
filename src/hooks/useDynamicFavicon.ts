"use client";

import { useEffect, useRef } from "react";
import { useFocusStore } from "@/stores/useFocusStore";
import { formatTime } from "@/lib/timeUtils";

export function useDynamicFavicon() {
    const status = useFocusStore((state) => state.status);
    const mode = useFocusStore((state) => state.mode);
    const timeLeft = useFocusStore((state) => state.timeLeft);
    const settings = useFocusStore((state) => state.settings);
    const currentIntent = useFocusStore((state) => state.currentIntent);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (typeof window === "undefined" || typeof document === "undefined") {
            return;
        }

        // 1. Update Title Bar Countdown
        const timeFormatted = formatTime(timeLeft);
        if (status === "running") {
            if (mode === "focus") {
                document.title = `(${timeFormatted}) ${currentIntent.trim() || "Focus"} • FocusDock`;
            } else {
                document.title = `(${timeFormatted}) Break • FocusDock`;
            }
        } else if (status === "paused") {
            document.title = `[Paused] (${timeFormatted}) • FocusDock`;
        } else {
            document.title = "FocusDock - Desktop Focus Engine";
        }

        // 2. Render Dynamic Favicon with Progress Arc
        if (!canvasRef.current) {
            canvasRef.current = document.createElement("canvas");
            canvasRef.current.width = 32;
            canvasRef.current.height = 32;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, 32, 32);

        const totalDuration =
            mode === "focus"
                ? settings.focusDuration
                : mode === "shortBreak"
                  ? settings.shortBreakDuration
                  : settings.longBreakDuration;

        const progress =
            totalDuration > 0
                ? Math.min(1, Math.max(0, (totalDuration - timeLeft) / totalDuration))
                : 0;

        const center = 16;
        const radius = 12;
        const lineWidth = 3.5;

        // Background circle track
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "#27272a"; // zinc-800
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        // Progress arc (starts from top -90deg)
        if (status === "running" || status === "paused") {
            const startAngle = -Math.PI / 2;
            const endAngle = startAngle + 2 * Math.PI * progress;

            ctx.beginPath();
            ctx.arc(center, center, radius, startAngle, endAngle);
            ctx.strokeStyle = mode === "focus" ? "#10b981" : "#f59e0b"; // emerald or amber
            ctx.lineWidth = lineWidth;
            ctx.lineCap = "round";
            ctx.stroke();
        } else {
            // Idle dot in center
            ctx.beginPath();
            ctx.arc(center, center, 4, 0, 2 * Math.PI);
            ctx.fillStyle = "#10b981";
            ctx.fill();
        }

        try {
            const faviconUrl = canvas.toDataURL("image/png");
            let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
            if (!link) {
                link = document.createElement("link");
                link.rel = "icon";
                document.head.appendChild(link);
            }
            link.type = "image/png";
            link.href = faviconUrl;
        } catch {
            // In case toDataURL is restricted
        }
    }, [status, mode, timeLeft, settings, currentIntent]);
}
