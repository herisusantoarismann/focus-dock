export type SessionMode = "focus" | "shortBreak" | "longBreak";
export type TimerStatus = "idle" | "running" | "paused";
export type WebhookPlatform = "discord" | "slack";
export type AudioPlaybackMode = "ambient" | "chimeOnly";

export interface TaskLogItem {
    id: string;
    title: string;
    durationMinutes: number; // actual minutes spent
    targetMinutes: number; // planned session duration (e.g. 25)
    isEarlyFinish: boolean;
    completedAt: string; // ISO string
}

export interface SoundState {
    rainVolume: number; // 0 - 1
    cafeVolume: number; // 0 - 1
    keyboardVolume: number; // 0 - 1
    isMuted: boolean;
    playbackMode: AudioPlaybackMode; // "ambient" | "chimeOnly"
}

export interface SettingsState {
    focusDuration: number; // in seconds (default 1500)
    shortBreakDuration: number; // in seconds (default 300)
    longBreakDuration: number; // in seconds (default 900)
    webhookUrl: string;
    webhookPlatform: WebhookPlatform;
    discordWebhookUrl?: string;
    slackWebhookUrl?: string;
}
