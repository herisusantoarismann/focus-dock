import { describe, it, expect, beforeEach, vi } from "vitest";
import { useFocusStore } from "@/stores/useFocusStore";

// Mock IndexedDB storage
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

describe("FocusDock - Audio Mixer & Playback Mode Store", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useFocusStore.setState({
            audio: {
                rainVolume: 0.5,
                cafeVolume: 0,
                keyboardVolume: 0,
                isMuted: false,
                playbackMode: "ambient",
            },
            isAudioPreviewing: false,
            status: "idle",
        });
    });

    it("adjusts track volumes within valid [0, 1] range", () => {
        const store = useFocusStore.getState();

        store.setAudioVolume("rainVolume", 0.8);
        expect(useFocusStore.getState().audio.rainVolume).toBe(0.8);

        store.setAudioVolume("cafeVolume", 0.4);
        expect(useFocusStore.getState().audio.cafeVolume).toBe(0.4);

        store.setAudioVolume("keyboardVolume", 0.6);
        expect(useFocusStore.getState().audio.keyboardVolume).toBe(0.6);

        // Clamping check: > 1 should clamp to 1
        store.setAudioVolume("rainVolume", 1.5);
        expect(useFocusStore.getState().audio.rainVolume).toBe(1.0);

        // Clamping check: < 0 should clamp to 0
        store.setAudioVolume("cafeVolume", -0.2);
        expect(useFocusStore.getState().audio.cafeVolume).toBe(0);
    });

    it("toggles master mute correctly", () => {
        const store = useFocusStore.getState();
        expect(store.audio.isMuted).toBe(false);

        store.toggleMute();
        expect(useFocusStore.getState().audio.isMuted).toBe(true);

        store.toggleMute();
        expect(useFocusStore.getState().audio.isMuted).toBe(false);
    });

    it("toggles audio preview correctly and stops when timer starts", () => {
        const store = useFocusStore.getState();
        expect(store.isAudioPreviewing).toBe(false);

        store.toggleAudioPreview();
        expect(useFocusStore.getState().isAudioPreviewing).toBe(true);

        // Starting timer should stop preview and transition to live session audio
        store.setIntent("Test Preview Stop");
        store.startTimer();
        expect(useFocusStore.getState().isAudioPreviewing).toBe(false);
        expect(useFocusStore.getState().status).toBe("running");
    });

    it("switches to Chime Only mode and halts active preview", () => {
        const store = useFocusStore.getState();
        store.toggleAudioPreview();
        expect(useFocusStore.getState().isAudioPreviewing).toBe(true);

        // Switch to chimeOnly
        store.setAudioPlaybackMode("chimeOnly");
        expect(useFocusStore.getState().audio.playbackMode).toBe("chimeOnly");
        expect(useFocusStore.getState().isAudioPreviewing).toBe(false);

        // Switch back to ambient
        store.setAudioPlaybackMode("ambient");
        expect(useFocusStore.getState().audio.playbackMode).toBe("ambient");
    });
});
