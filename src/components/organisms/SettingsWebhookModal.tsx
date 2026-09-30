"use client";

import React, { useState, useEffect } from "react";
import { useFocusStore } from "@/stores/useFocusStore";
import { FormInput } from "@/components/atoms/FormInput";
import { Button } from "@/components/atoms/Button";
import { TaskLogItem, WebhookPlatform } from "@/types/focus";
import { sendDailyLogToWebhook } from "@/lib/webhookService";
import { X, Settings, Webhook, Timer, Check, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

export interface SettingsWebhookModalProps {
    isOpen: boolean;
    onClose: () => void;
}

function SettingsModalContent({ onClose }: { onClose: () => void }) {
    const settings = useFocusStore((state) => state.settings);
    const updateSettings = useFocusStore((state) => state.updateSettings);

    const [focusMin, setFocusMin] = useState(() =>
        Math.round(settings.focusDuration / 60),
    );
    const [shortBreakMin, setShortBreakMin] = useState(() =>
        Math.round(settings.shortBreakDuration / 60),
    );
    const [longBreakMin, setLongBreakMin] = useState(() =>
        Math.round(settings.longBreakDuration / 60),
    );
    const [discordUrl, setDiscordUrl] = useState(
        () =>
            settings.discordWebhookUrl ||
            (settings.webhookPlatform === "discord" ? settings.webhookUrl : ""),
    );
    const [slackUrl, setSlackUrl] = useState(
        () =>
            settings.slackWebhookUrl ||
            (settings.webhookPlatform === "slack" ? settings.webhookUrl : ""),
    );
    const [webhookPlatform, setWebhookPlatform] = useState<WebhookPlatform>(
        () => settings.webhookPlatform,
    );

    const [testStatus, setTestStatus] = useState<
        "idle" | "testing" | "success" | "error"
    >("idle");
    const [testMessage, setTestMessage] = useState("");
    const [savedSuccess, setSavedSuccess] = useState(false);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleSave = () => {
        const focusDuration = Math.max(1, Math.min(120, focusMin)) * 60;
        const shortBreakDuration =
            Math.max(1, Math.min(60, shortBreakMin)) * 60;
        const longBreakDuration = Math.max(1, Math.min(90, longBreakMin)) * 60;

        const cleanDiscordUrl = discordUrl.trim();
        const cleanSlackUrl = slackUrl.trim();
        const activeUrl =
            webhookPlatform === "slack" ? cleanSlackUrl : cleanDiscordUrl;

        updateSettings({
            focusDuration,
            shortBreakDuration,
            longBreakDuration,
            webhookUrl: activeUrl,
            webhookPlatform,
            discordWebhookUrl: cleanDiscordUrl,
            slackWebhookUrl: cleanSlackUrl,
        });

        setSavedSuccess(true);
        setTimeout(() => {
            setSavedSuccess(false);
            onClose();
        }, 500);
    };

    const handleTestWebhook = async () => {
        const currentUrl = (
            webhookPlatform === "slack" ? slackUrl : discordUrl
        ).trim();
        if (!currentUrl) {
            setTestStatus("error");
            setTestMessage(
                `Please provide a valid ${webhookPlatform === "slack" ? "Slack" : "Discord"} Webhook URL.`,
            );
            return;
        }

        setTestStatus("testing");
        setTestMessage("");

        const dummyLog: TaskLogItem[] = [
            {
                id: "test",
                title: "Test Connection from FocusDock",
                durationMinutes: 25,
                targetMinutes: 25,
                isEarlyFinish: false,
                completedAt: new Date().toISOString(),
            },
        ];

        const ok = await sendDailyLogToWebhook(
            currentUrl,
            webhookPlatform,
            dummyLog,
        );

        if (ok) {
            setTestStatus("success");
            setTestMessage(
                `${webhookPlatform === "slack" ? "Slack" : "Discord"} test message sent successfully!`,
            );
        } else {
            setTestStatus("error");
            setTestMessage(
                `Failed to reach ${webhookPlatform === "slack" ? "Slack" : "Discord"}. Verify the URL.`,
            );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
            <div
                className="flex flex-col w-full max-w-md mx-auto bg-zinc-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]"
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-title"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-3.5 sm:p-4 px-4 sm:px-6 border-b border-slate-800 bg-zinc-950/60 shrink-0">
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-emerald-400" />
                        <h2
                            id="settings-title"
                            className="text-base font-bold text-white"
                        >
                            Workspace Settings
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-zinc-800 transition-colors"
                        aria-label="Close settings"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex flex-col gap-5 sm:gap-6 p-4 sm:p-6 overflow-y-auto">
                    {/* Section 1: Timer Durations */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                            <Timer className="w-4 h-4 text-emerald-400" />
                            <span>Interval Durations (Minutes)</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400 font-medium">
                                    Focus
                                </span>
                                <input
                                    type="number"
                                    min={1}
                                    max={120}
                                    value={focusMin}
                                    onChange={(e) =>
                                        setFocusMin(Number(e.target.value))
                                    }
                                    className="bg-zinc-950 text-slate-100 rounded-xl px-2.5 sm:px-3 py-2 text-sm border border-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-center w-full"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400 font-medium truncate">
                                    Short Break
                                </span>
                                <input
                                    type="number"
                                    min={1}
                                    max={60}
                                    value={shortBreakMin}
                                    onChange={(e) =>
                                        setShortBreakMin(Number(e.target.value))
                                    }
                                    className="bg-zinc-950 text-slate-100 rounded-xl px-2.5 sm:px-3 py-2 text-sm border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono text-center w-full"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400 font-medium truncate">
                                    Long Break
                                </span>
                                <input
                                    type="number"
                                    min={1}
                                    max={90}
                                    value={longBreakMin}
                                    onChange={(e) =>
                                        setLongBreakMin(Number(e.target.value))
                                    }
                                    className="bg-zinc-950 text-slate-100 rounded-xl px-2.5 sm:px-3 py-2 text-sm border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono text-center w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Webhook Dispatcher */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                            <Webhook className="w-4 h-4 text-emerald-400" />
                            <span>Webhook Dispatcher</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-xs text-slate-400 font-medium">
                                Platform
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setWebhookPlatform("discord")
                                    }
                                    className={clsx(
                                        "py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center",
                                        webhookPlatform === "discord"
                                            ? "bg-indigo-950/80 text-indigo-300 border-indigo-500/60 shadow-sm"
                                            : "bg-zinc-950 text-slate-400 border-slate-800 hover:border-slate-700",
                                    )}
                                >
                                    Discord
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setWebhookPlatform("slack")}
                                    className={clsx(
                                        "py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center",
                                        webhookPlatform === "slack"
                                            ? "bg-amber-950/80 text-amber-300 border-amber-500/60 shadow-sm"
                                            : "bg-zinc-950 text-slate-400 border-slate-800 hover:border-slate-700",
                                    )}
                                >
                                    Slack
                                </button>
                            </div>
                        </div>

                        <FormInput
                            label={
                                webhookPlatform === "slack"
                                    ? "Slack Incoming Webhook URL"
                                    : "Discord Incoming Webhook URL"
                            }
                            value={
                                webhookPlatform === "slack"
                                    ? slackUrl
                                    : discordUrl
                            }
                            onChange={(e) =>
                                webhookPlatform === "slack"
                                    ? setSlackUrl(e.target.value)
                                    : setDiscordUrl(e.target.value)
                            }
                            onClear={() =>
                                webhookPlatform === "slack"
                                    ? setSlackUrl("")
                                    : setDiscordUrl("")
                            }
                            placeholder={
                                webhookPlatform === "slack"
                                    ? "https://hooks.slack.com/services/..."
                                    : "https://discord.com/api/webhooks/..."
                            }
                            className="text-xs font-mono"
                        />

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleTestWebhook}
                                disabled={
                                    testStatus === "testing" ||
                                    !(webhookPlatform === "slack"
                                        ? slackUrl.trim()
                                        : discordUrl.trim())
                                }
                                isLoading={testStatus === "testing"}
                                className="text-xs w-full sm:w-auto"
                            >
                                Test{" "}
                                {webhookPlatform === "slack"
                                    ? "Slack"
                                    : "Discord"}{" "}
                                Webhook
                            </Button>

                            {testMessage ? (
                                <span
                                    className={clsx(
                                        "text-xs flex items-center gap-1 font-medium",
                                        testStatus === "error"
                                            ? "text-red-400"
                                            : "text-emerald-400",
                                    )}
                                >
                                    {testStatus === "error" ? (
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    ) : (
                                        <Check className="w-3.5 h-3.5 shrink-0" />
                                    )}
                                    {testMessage}
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-2 p-3.5 sm:p-4 px-4 sm:px-6 border-t border-slate-800 bg-zinc-950/60 shrink-0">
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="emerald"
                        size="sm"
                        onClick={handleSave}
                        className="min-w-[90px]"
                    >
                        {savedSuccess ? (
                            <>
                                <Check className="w-4 h-4 mr-1" />
                                <span>Saved</span>
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function SettingsWebhookModal({
    isOpen,
    onClose,
}: SettingsWebhookModalProps) {
    if (!isOpen) return null;
    return <SettingsModalContent onClose={onClose} />;
}
