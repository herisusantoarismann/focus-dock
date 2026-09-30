"use client";

import React, { useEffect } from "react";
import { useFocusStore } from "@/stores/useFocusStore";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { useDocumentPiP } from "@/hooks/useDocumentPiP";
import { useProceduralAudio } from "@/hooks/useProceduralAudio";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useDynamicFavicon } from "@/hooks/useDynamicFavicon";

export default function HomePage() {
    const hydrateFromIDB = useFocusStore((state) => state.hydrateFromIDB);
    const tick = useFocusStore((state) => state.tick);
    const status = useFocusStore((state) => state.status);
    const startTimer = useFocusStore((state) => state.startTimer);
    const pauseTimer = useFocusStore((state) => state.pauseTimer);

    // Initialize Dynamic Favicon & Title Bar countdown hook
    useDynamicFavicon();

    // Initialize Web Audio Engine hook (without auto-resume on mount)
    const { initAudio } = useProceduralAudio();

    // Initialize Document PiP hook
    const {
        isSupported: isPipSupported,
        isPipOpen,
        pipWindow,
        togglePip,
    } = useDocumentPiP();

    // Initialize Global Keyboard Shortcuts (Space, Cmd+Enter, Alt+P)
    useKeyboardShortcuts({
        onTogglePip: () => {
            void togglePip();
        },
        onToggleTimer: () => {
            initAudio();
            if (status === "running") {
                pauseTimer();
            } else {
                startTimer();
            }
        },
    });

    // Hydration Protection: trigger IndexedDB read inside a client useEffect
    useEffect(() => {
        void hydrateFromIDB();
    }, [hydrateFromIDB]);

    // Main countdown timer ticker interval
    useEffect(() => {
        if (status !== "running") return;

        const interval = setInterval(() => {
            tick();
        }, 1000);

        return () => clearInterval(interval);
    }, [status, tick]);

    return (
        <DashboardTemplate
            isPipSupported={isPipSupported}
            isPipOpen={isPipOpen}
            pipWindow={pipWindow}
            onTogglePip={() => {
                void togglePip();
            }}
            onInteractAudio={initAudio}
        />
    );
}
