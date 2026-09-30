import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
    SessionMode,
    SettingsState,
    SoundState,
    AudioPlaybackMode,
    TaskLogItem,
    TimerStatus,
} from "@/types/focus";
import {
    getAudioSettings,
    getCompletedPomodorosFromIDB,
    getSettingsFromIDB,
    getTaskLogsFromIDB,
    saveAudioSettings,
    saveCompletedPomodorosToIDB,
    saveSettingsToIDB,
    saveTaskLogsToIDB,
} from "@/lib/idbStorage";
import { playCompletionChime } from "@/lib/chimeAudio";

export interface FocusStore {
    // Timer State
    status: TimerStatus;
    mode: SessionMode;
    timeLeft: number;
    completedPomodoros: number;

    // Task & Intent
    currentIntent: string;
    taskLogs: TaskLogItem[];

    // Audio & Settings
    audio: SoundState;
    settings: SettingsState;
    isAudioPreviewing: boolean;

    // Actions
    setIntent: (text: string) => void;
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    tick: () => void;
    completeSession: () => void;
    skipBreak: () => void;
    setAudioVolume: (
        key: keyof Omit<SoundState, "isMuted" | "playbackMode">,
        value: number,
    ) => void;
    setAudioPlaybackMode: (mode: AudioPlaybackMode) => void;
    toggleMute: () => void;
    toggleAudioPreview: () => void;
    stopAudioPreview: () => void;
    updateSettings: (newSettings: Partial<SettingsState>) => void;
    deleteLog: (id: string) => void;
    hydrateFromIDB: () => Promise<void>;
}

const DEFAULT_SETTINGS: SettingsState = {
    focusDuration: 1500,
    shortBreakDuration: 300,
    longBreakDuration: 900,
    webhookUrl: "",
    webhookPlatform: "discord",
};

const DEFAULT_AUDIO: SoundState = {
    rainVolume: 0.5,
    cafeVolume: 0,
    keyboardVolume: 0,
    isMuted: false,
    playbackMode: "ambient",
};

export const useFocusStore = create<FocusStore>()(
    immer((set, get) => ({
        // Initial State
        status: "idle",
        mode: "focus",
        timeLeft: DEFAULT_SETTINGS.focusDuration,
        completedPomodoros: 0,

        currentIntent: "",
        taskLogs: [],

        audio: DEFAULT_AUDIO,
        settings: DEFAULT_SETTINGS,
        isAudioPreviewing: false,

        setIntent: (text: string) => {
            set((state) => {
                state.currentIntent = text;
            });
        },

        startTimer: () => {
            set((state) => {
                // Enforce non-empty task intent: only allow startTimer if mode !== 'focus' OR currentIntent.trim().length > 0
                if (state.mode === "focus" && !state.currentIntent.trim()) {
                    return;
                }
                state.isAudioPreviewing = false;
                if (state.status !== "running") {
                    state.status = "running";
                }
            });
        },

        pauseTimer: () => {
            set((state) => {
                if (state.status === "running") {
                    state.status = "paused";
                }
            });
        },

        resetTimer: () => {
            set((state) => {
                state.status = "idle";
                if (state.mode === "focus") {
                    state.timeLeft = state.settings.focusDuration;
                } else if (state.mode === "shortBreak") {
                    state.timeLeft = state.settings.shortBreakDuration;
                } else {
                    state.timeLeft = state.settings.longBreakDuration;
                }
            });
        },

        tick: () => {
            const { status, timeLeft } = get();
            if (status !== "running") return;

            if (timeLeft > 1) {
                set((state) => {
                    state.timeLeft -= 1;
                });
            } else {
                set((state) => {
                    state.timeLeft = 0;
                });
                get().completeSession();
            }
        },

        completeSession: () => {
            playCompletionChime();

            // Native browser notification if supported and permitted
            if (
                typeof window !== "undefined" &&
                "Notification" in window &&
                Notification.permission === "granted"
            ) {
                try {
                    const currentMode = get().mode;
                    const notifTitle =
                        currentMode === "focus"
                            ? "Focus Session Complete! 🎉"
                            : "Break Finished! ⚡";
                    const notifBody =
                        currentMode === "focus"
                            ? "Great work! Time to step away, stretch, and take a break."
                            : "Break is over. Ready to start your next focus sprint?";
                    new Notification(notifTitle, { body: notifBody });
                } catch {
                    // Ignore notification errors
                }
            }

            set((state) => {
                if (state.mode === "focus") {
                    const elapsedSeconds =
                        state.settings.focusDuration - state.timeLeft;
                    const targetMinutes = Math.round(
                        state.settings.focusDuration / 60,
                    );

                    // If elapsedSeconds < 20, do not log (treat as accidental click)
                    if (elapsedSeconds >= 20) {
                        const elapsedMinutes = Math.max(
                            1,
                            Math.round(elapsedSeconds / 60),
                        );
                        const isEarlyFinish = state.timeLeft > 0;

                        const newLog: TaskLogItem = {
                            id:
                                typeof crypto !== "undefined" &&
                                crypto.randomUUID
                                    ? crypto.randomUUID()
                                    : `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                            title:
                                state.currentIntent.trim() || "Focus Session",
                            durationMinutes: elapsedMinutes,
                            targetMinutes,
                            isEarlyFinish,
                            completedAt: new Date().toISOString(),
                        };

                        state.taskLogs.unshift(newLog);
                        state.completedPomodoros += 1;

                        // Check if 4 pomodoros completed for long break
                        const isLongBreak = state.completedPomodoros % 4 === 0;
                        state.mode = isLongBreak ? "longBreak" : "shortBreak";
                        state.timeLeft = isLongBreak
                            ? state.settings.longBreakDuration
                            : state.settings.shortBreakDuration;
                        state.status = "idle";
                        state.isAudioPreviewing = false;
                    } else {
                        // Accidental click (<20s), reset to idle without logging
                        state.status = "idle";
                        state.timeLeft = state.settings.focusDuration;
                        state.isAudioPreviewing = false;
                    }
                } else {
                    // Break finished, transition back to focus
                    state.mode = "focus";
                    state.timeLeft = state.settings.focusDuration;
                    state.status = "idle";
                    state.isAudioPreviewing = false;
                }
            });

            // Persist logs and count outside Immer draft recipe
            const { taskLogs, completedPomodoros } = get();
            void saveTaskLogsToIDB(taskLogs);
            void saveCompletedPomodorosToIDB(completedPomodoros);
        },

        skipBreak: () => {
            set((state) => {
                if (state.mode !== "focus") {
                    state.mode = "focus";
                    state.timeLeft = state.settings.focusDuration;
                    state.status = "idle";
                }
            });
        },

        setAudioVolume: (key, value) => {
            const clampedValue = Math.max(0, Math.min(1, value));
            set((state) => {
                state.audio[key] = clampedValue;
            });

            // Extract only clean primitive sound values outside Immer draft
            const currentAudio = get().audio;
            void saveAudioSettings({
                rainVolume: currentAudio.rainVolume,
                cafeVolume: currentAudio.cafeVolume,
                keyboardVolume: currentAudio.keyboardVolume,
                isMuted: currentAudio.isMuted,
                playbackMode: currentAudio.playbackMode,
            });
        },

        setAudioPlaybackMode: (playbackMode) => {
            set((state) => {
                state.audio.playbackMode = playbackMode;
                if (playbackMode === "chimeOnly") {
                    state.isAudioPreviewing = false;
                }
            });

            const currentAudio = get().audio;
            void saveAudioSettings({
                rainVolume: currentAudio.rainVolume,
                cafeVolume: currentAudio.cafeVolume,
                keyboardVolume: currentAudio.keyboardVolume,
                isMuted: currentAudio.isMuted,
                playbackMode: currentAudio.playbackMode,
            });
        },

        toggleMute: () => {
            set((state) => {
                state.audio.isMuted = !state.audio.isMuted;
            });

            // Extract only clean primitive sound values outside Immer draft
            const currentAudio = get().audio;
            void saveAudioSettings({
                rainVolume: currentAudio.rainVolume,
                cafeVolume: currentAudio.cafeVolume,
                keyboardVolume: currentAudio.keyboardVolume,
                isMuted: currentAudio.isMuted,
                playbackMode: currentAudio.playbackMode,
            });
        },

        toggleAudioPreview: () => {
            set((state) => {
                state.isAudioPreviewing = !state.isAudioPreviewing;
            });
        },

        stopAudioPreview: () => {
            set((state) => {
                state.isAudioPreviewing = false;
            });
        },

        updateSettings: (newSettings) => {
            set((state) => {
                state.settings = { ...state.settings, ...newSettings };
                if (state.status === "idle") {
                    if (state.mode === "focus") {
                        state.timeLeft = state.settings.focusDuration;
                    } else if (state.mode === "shortBreak") {
                        state.timeLeft = state.settings.shortBreakDuration;
                    } else {
                        state.timeLeft = state.settings.longBreakDuration;
                    }
                }
            });

            const currentSettings = get().settings;
            void saveSettingsToIDB(currentSettings);
        },

        deleteLog: (id: string) => {
            set((state) => {
                state.taskLogs = state.taskLogs.filter((log) => log.id !== id);
            });

            const currentLogs = get().taskLogs;
            void saveTaskLogsToIDB(currentLogs);
        },

        hydrateFromIDB: async () => {
            try {
                const [savedLogs, savedSettings, savedAudio, savedCount] =
                    await Promise.all([
                        getTaskLogsFromIDB(),
                        getSettingsFromIDB(),
                        getAudioSettings(),
                        getCompletedPomodorosFromIDB(),
                    ]);

                set((state) => {
                    if (savedLogs && savedLogs.length > 0) {
                        state.taskLogs = savedLogs;
                    }
                    if (savedSettings) {
                        state.settings = {
                            ...state.settings,
                            ...savedSettings,
                        };
                    }
                    if (savedAudio) {
                        state.audio = {
                            rainVolume: Number(savedAudio.rainVolume ?? 0.5),
                            cafeVolume: Number(savedAudio.cafeVolume ?? 0),
                            keyboardVolume: Number(
                                savedAudio.keyboardVolume ?? 0,
                            ),
                            isMuted: Boolean(savedAudio.isMuted),
                            playbackMode:
                                savedAudio.playbackMode === "chimeOnly"
                                    ? "chimeOnly"
                                    : "ambient",
                        };
                    }
                    if (typeof savedCount === "number") {
                        state.completedPomodoros = savedCount;
                    }

                    if (state.status === "idle") {
                        if (state.mode === "focus") {
                            state.timeLeft = state.settings.focusDuration;
                        } else if (state.mode === "shortBreak") {
                            state.timeLeft = state.settings.shortBreakDuration;
                        } else {
                            state.timeLeft = state.settings.longBreakDuration;
                        }
                    }
                });
            } catch (error) {
                console.error("Failed to hydrate state from IndexedDB:", error);
            }
        },
    })),
);
