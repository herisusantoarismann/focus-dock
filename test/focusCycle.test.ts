import { describe, it, expect, beforeEach, vi } from "vitest";
import { useFocusStore } from "@/stores/useFocusStore";
import * as chimeModule from "@/lib/chimeAudio";

// Mock the chime audio module
vi.mock("@/lib/chimeAudio", () => ({
    playCompletionChime: vi.fn(),
    getSharedAudioContext: vi.fn(),
}));

// Mock IndexedDB storage so store operations don't touch actual storage during tests
vi.mock("@/lib/idbStorage", () => ({
    getAudioSettings: vi.fn().mockResolvedValue(undefined),
    getCompletedPomodorosFromIDB: vi.fn().mockResolvedValue(0),
    getSettingsFromIDB: vi.fn().mockResolvedValue(undefined),
    getTaskLogsFromIDB: vi.fn().mockResolvedValue([]),
    saveAudioSettings: vi.fn().mockResolvedValue(undefined),
    saveCompletedPomodorosToIDB: vi.fn().mockResolvedValue(undefined),
    saveSettingsToIDB: vi.fn().mockResolvedValue(undefined),
    saveTaskLogsToIDB: vi.fn().mockResolvedValue(undefined),
}));

describe("FocusDock - Full Focus Session Cycle & Bell Chime", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset store state
        useFocusStore.setState({
            status: "idle",
            mode: "focus",
            timeLeft: 1500,
            completedPomodoros: 0,
            currentIntent: "",
            taskLogs: [],
            isAudioPreviewing: false,
            settings: {
                focusDuration: 1500,
                shortBreakDuration: 300,
                longBreakDuration: 900,
                webhookUrl: "",
                webhookPlatform: "discord",
            },
        });
    });

    it("enforces non-empty task intent before starting a focus sprint", () => {
        const store = useFocusStore.getState();
        expect(store.currentIntent).toBe("");

        // Attempting to start with empty intent should NOT start timer
        store.startTimer();
        expect(useFocusStore.getState().status).toBe("idle");

        // Setting a valid intent allows starting
        store.setIntent("Build FocusDock Test Suite");
        useFocusStore.getState().startTimer();
        expect(useFocusStore.getState().status).toBe("running");
        expect(useFocusStore.getState().currentIntent).toBe(
            "Build FocusDock Test Suite",
        );
    });

    it("ticks down and naturally finishes session with chime ringing", () => {
        const store = useFocusStore.getState();
        store.setIntent("Deep Work Sprint");
        store.startTimer();

        // Fast-forward to 2 seconds left
        useFocusStore.setState({ timeLeft: 2 });
        expect(useFocusStore.getState().timeLeft).toBe(2);

        // Tick to 1 second
        useFocusStore.getState().tick();
        expect(useFocusStore.getState().timeLeft).toBe(1);

        // Tick to 0 triggers completeSession
        useFocusStore.getState().tick();

        // 1. Verify bell chime played
        expect(chimeModule.playCompletionChime).toHaveBeenCalledTimes(1);

        // 2. Verify transitioned to break mode
        const state = useFocusStore.getState();
        expect(state.mode).toBe("shortBreak");
        expect(state.status).toBe("idle");
        expect(state.completedPomodoros).toBe(1);
        expect(state.timeLeft).toBe(state.settings.shortBreakDuration);

        // 3. Verify task was logged as a Full Session
        expect(state.taskLogs.length).toBe(1);
        const log = state.taskLogs[0];
        expect(log.title).toBe("Deep Work Sprint");
        expect(log.isEarlyFinish).toBe(false);
        expect(log.durationMinutes).toBe(25);
    });

    it("plays bell chime and records early finish when session is completed early", () => {
        const store = useFocusStore.getState();
        store.setIntent("Refactor Database Schema");
        store.startTimer();

        // Simulate 12 minutes elapsed (e.g., 780s elapsed, 720s left out of 1500s)
        useFocusStore.setState({ timeLeft: 720 });

        // User clicks Complete Early
        useFocusStore.getState().completeSession();

        // 1. Verify bell chime played
        expect(chimeModule.playCompletionChime).toHaveBeenCalledTimes(1);

        // 2. Verify state
        const state = useFocusStore.getState();
        expect(state.mode).toBe("shortBreak");
        expect(state.completedPomodoros).toBe(1);

        // 3. Verify task was logged with early finish tag
        expect(state.taskLogs.length).toBe(1);
        const log = state.taskLogs[0];
        expect(log.title).toBe("Refactor Database Schema");
        expect(log.isEarlyFinish).toBe(true);
        expect(log.durationMinutes).toBe(13); // 780 / 60 = 13
        expect(log.targetMinutes).toBe(25);
    });

    it("ignores accidental completion clicks under 20 seconds", () => {
        const store = useFocusStore.getState();
        store.setIntent("Accidental Click Test");
        store.startTimer();

        // Only 5 seconds elapsed (1495s left)
        useFocusStore.setState({ timeLeft: 1495 });

        useFocusStore.getState().completeSession();

        // Chime plays to confirm action, but task is NOT logged as spam/accident
        expect(chimeModule.playCompletionChime).toHaveBeenCalledTimes(1);
        expect(useFocusStore.getState().taskLogs.length).toBe(0);
    });

    it("triggers longBreak after 4 completed focus sprints", () => {
        useFocusStore.setState({
            completedPomodoros: 3,
            currentIntent: "Sprint 4",
            timeLeft: 0,
        });

        useFocusStore.getState().completeSession();

        const state = useFocusStore.getState();
        expect(state.completedPomodoros).toBe(4);
        expect(state.mode).toBe("longBreak");
        expect(state.timeLeft).toBe(state.settings.longBreakDuration);
    });

    it("allows skipping break to immediately return to focus mode", () => {
        useFocusStore.setState({
            mode: "shortBreak",
            status: "running",
            timeLeft: 200,
        });

        useFocusStore.getState().skipBreak();

        const state = useFocusStore.getState();
        expect(state.mode).toBe("focus");
        expect(state.status).toBe("idle");
        expect(state.timeLeft).toBe(state.settings.focusDuration);
    });
});
