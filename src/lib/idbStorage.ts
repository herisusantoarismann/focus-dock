import { get, set, del } from "idb-keyval";
import { SettingsState, SoundState, TaskLogItem } from "@/types/focus";

export const STORAGE_KEYS = {
    TASK_LOGS: "focusdock_task_logs",
    SETTINGS: "focusdock_settings",
    AUDIO: "focusdock_audio_settings",
    COMPLETED_COUNT: "focusdock_completed_pomodoros",
} as const;

/**
 * Persist only clean, primitive sound values to IndexedDB.
 * Prevents DataCloneError caused by non-cloneable objects or Immer proxy drafts.
 */
export async function saveAudioSettings(audio: {
    rainVolume: number;
    cafeVolume: number;
    keyboardVolume: number;
    isMuted: boolean;
    playbackMode?: string;
}): Promise<void> {
    if (typeof window === "undefined") return;

    const cleanData: SoundState = {
        rainVolume: Number(audio.rainVolume ?? 0.5),
        cafeVolume: Number(audio.cafeVolume ?? 0),
        keyboardVolume: Number(audio.keyboardVolume ?? 0),
        isMuted: Boolean(audio.isMuted),
        playbackMode:
            audio.playbackMode === "chimeOnly" ? "chimeOnly" : "ambient",
    };

    await set(STORAGE_KEYS.AUDIO, cleanData);
}

export const saveAudioToIDB = saveAudioSettings;

export async function getAudioSettings(): Promise<SoundState | undefined> {
    if (typeof window === "undefined") return undefined;

    let data = await get<SoundState>(STORAGE_KEYS.AUDIO);
    if (!data) {
        // Fallback to previous key if present
        data = await get<SoundState>("focusdock_audio");
    }

    if (!data) return undefined;

    return {
        rainVolume: Number(data.rainVolume ?? 0.5),
        cafeVolume: Number(data.cafeVolume ?? 0),
        keyboardVolume: Number(data.keyboardVolume ?? 0),
        isMuted: Boolean(data.isMuted),
        playbackMode:
            data.playbackMode === "chimeOnly" ? "chimeOnly" : "ambient",
    };
}

export const getAudioFromIDB = getAudioSettings;

export async function saveTaskLogsToIDB(logs: TaskLogItem[]): Promise<void> {
    if (typeof window === "undefined") return;

    const cleanLogs: TaskLogItem[] = logs.map((l) => ({
        id: String(l.id),
        title: String(l.title),
        durationMinutes: Number(l.durationMinutes),
        targetMinutes: Number(l.targetMinutes ?? l.durationMinutes),
        isEarlyFinish: Boolean(l.isEarlyFinish),
        completedAt: String(l.completedAt),
    }));

    await set(STORAGE_KEYS.TASK_LOGS, cleanLogs);
}

export async function getTaskLogsFromIDB(): Promise<TaskLogItem[]> {
    if (typeof window === "undefined") return [];
    const logs = await get<TaskLogItem[]>(STORAGE_KEYS.TASK_LOGS);
    if (!Array.isArray(logs)) return [];

    return logs.map((l) => ({
        id: String(l.id),
        title: String(l.title),
        durationMinutes: Number(l.durationMinutes),
        targetMinutes: Number(l.targetMinutes ?? l.durationMinutes),
        isEarlyFinish: Boolean(l.isEarlyFinish),
        completedAt: String(l.completedAt),
    }));
}

export async function saveSettingsToIDB(
    settings: SettingsState,
): Promise<void> {
    if (typeof window === "undefined") return;

    const cleanSettings: SettingsState = {
        focusDuration: Number(settings.focusDuration),
        shortBreakDuration: Number(settings.shortBreakDuration),
        longBreakDuration: Number(settings.longBreakDuration),
        webhookUrl: String(settings.webhookUrl ?? ""),
        webhookPlatform:
            settings.webhookPlatform === "slack" ? "slack" : "discord",
        discordWebhookUrl: settings.discordWebhookUrl
            ? String(settings.discordWebhookUrl)
            : undefined,
        slackWebhookUrl: settings.slackWebhookUrl
            ? String(settings.slackWebhookUrl)
            : undefined,
    };

    await set(STORAGE_KEYS.SETTINGS, cleanSettings);
}

export async function getSettingsFromIDB(): Promise<SettingsState | undefined> {
    if (typeof window === "undefined") return undefined;
    const s = await get<SettingsState>(STORAGE_KEYS.SETTINGS);
    if (!s) return undefined;

    return {
        focusDuration: Number(s.focusDuration ?? 1500),
        shortBreakDuration: Number(s.shortBreakDuration ?? 300),
        longBreakDuration: Number(s.longBreakDuration ?? 900),
        webhookUrl: String(s.webhookUrl ?? ""),
        webhookPlatform: s.webhookPlatform === "slack" ? "slack" : "discord",
        discordWebhookUrl: s.discordWebhookUrl
            ? String(s.discordWebhookUrl)
            : undefined,
        slackWebhookUrl: s.slackWebhookUrl
            ? String(s.slackWebhookUrl)
            : undefined,
    };
}

export async function saveCompletedPomodorosToIDB(
    count: number,
): Promise<void> {
    if (typeof window === "undefined") return;
    await set(STORAGE_KEYS.COMPLETED_COUNT, Number(count));
}

export async function getCompletedPomodorosFromIDB(): Promise<number> {
    if (typeof window === "undefined") return 0;
    const count = await get<number>(STORAGE_KEYS.COMPLETED_COUNT);
    return typeof count === "number" && !isNaN(count) ? count : 0;
}

export async function clearAllIDBData(): Promise<void> {
    if (typeof window === "undefined") return;
    await del(STORAGE_KEYS.TASK_LOGS);
    await del(STORAGE_KEYS.SETTINGS);
    await del(STORAGE_KEYS.AUDIO);
    await del("focusdock_audio");
    await del(STORAGE_KEYS.COMPLETED_COUNT);
}
