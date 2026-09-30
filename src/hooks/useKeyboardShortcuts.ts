"use client";

import { useEffect, useRef } from "react";
import { useFocusStore } from "@/stores/useFocusStore";

interface KeyboardShortcutOptions {
    onToggleTimer?: () => void;
    onCompleteTask?: () => void;
    onTogglePip?: () => void;
    enabled?: boolean;
}

export function useKeyboardShortcuts(options?: KeyboardShortcutOptions) {
    const {
        enabled = true,
        onToggleTimer,
        onCompleteTask,
        onTogglePip,
    } = options ?? {};

    const status = useFocusStore((state) => state.status);
    const startTimer = useFocusStore((state) => state.startTimer);
    const pauseTimer = useFocusStore((state) => state.pauseTimer);
    const completeSession = useFocusStore((state) => state.completeSession);

    // Keep latest callbacks and state in a ref to avoid recreation of listener
    const latestRef = useRef({
        enabled,
        onToggleTimer,
        onCompleteTask,
        onTogglePip,
        status,
        startTimer,
        pauseTimer,
        completeSession,
    });

    useEffect(() => {
        latestRef.current = {
            enabled,
            onToggleTimer,
            onCompleteTask,
            onTogglePip,
            status,
            startTimer,
            pauseTimer,
            completeSession,
        };
    });

    useEffect(() => {
        if (typeof window === "undefined" || !enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const current = latestRef.current;
            if (!current.enabled) return;

            const target = e.target as HTMLElement | null;
            const isInputElement =
                target &&
                (target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.isContentEditable);

            // 1. Alt + P -> Toggle Picture-in-Picture
            if (e.altKey && (e.key === "p" || e.key === "P")) {
                e.preventDefault();
                current.onTogglePip?.();
                return;
            }

            // 2. Ctrl/Cmd + Enter -> Complete active task early
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                if (current.onCompleteTask) {
                    current.onCompleteTask();
                } else {
                    current.completeSession();
                }
                return;
            }

            // 3. Space -> Toggle Start/Pause (prevent default scroll unless typing in input)
            if (e.code === "Space" && !isInputElement) {
                e.preventDefault();
                if (current.onToggleTimer) {
                    current.onToggleTimer();
                } else {
                    if (current.status === "running") {
                        current.pauseTimer();
                    } else {
                        current.startTimer();
                    }
                }
                return;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [enabled]);
}
