"use client";

import React, { useState } from "react";
import { useFocusStore } from "@/stores/useFocusStore";
import { WorkLogItem } from "@/components/molecules/WorkLogItem";
import { Button } from "@/components/atoms/Button";
import {
    generateMarkdownLogs,
    sendDailyLogToWebhook,
} from "@/lib/webhookService";
import {
    ListTodo,
    Copy,
    Send,
    Check,
    AlertCircle,
    Clock,
    Settings2,
} from "lucide-react";
import { clsx } from "clsx";
import { WebhookPlatform } from "@/types/focus";

export interface WorkLogFeedProps {
    onOpenSettings?: () => void;
    className?: string;
}

export function WorkLogFeed({ onOpenSettings, className }: WorkLogFeedProps) {
    const taskLogs = useFocusStore((state) => state.taskLogs);
    const deleteLog = useFocusStore((state) => state.deleteLog);
    const settings = useFocusStore((state) => state.settings);
    const updateSettings = useFocusStore((state) => state.updateSettings);

    const [copySuccess, setCopySuccess] = useState(false);
    const [webhookStatus, setWebhookStatus] = useState<
        "idle" | "sending" | "success" | "error"
    >("idle");
    const [webhookMessage, setWebhookMessage] = useState("");

    const totalMinutes = taskLogs.reduce(
        (acc, curr) => acc + curr.durationMinutes,
        0,
    );

    const handleSwitchPlatform = (targetPlatform: WebhookPlatform) => {
        const targetUrl =
            targetPlatform === "slack"
                ? settings.slackWebhookUrl ||
                  (settings.webhookPlatform === "slack"
                      ? settings.webhookUrl
                      : "")
                : settings.discordWebhookUrl ||
                  (settings.webhookPlatform === "discord"
                      ? settings.webhookUrl
                      : "");

        updateSettings({
            webhookPlatform: targetPlatform,
            webhookUrl: targetUrl,
        });
    };

    const handleCopyMarkdown = async () => {
        try {
            const md = generateMarkdownLogs(taskLogs);
            await navigator.clipboard.writeText(md);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error("Failed to copy logs:", err);
        }
    };

    const handleSendWebhook = async () => {
        const activeUrl = settings.webhookUrl?.trim();
        const platformName =
            settings.webhookPlatform === "slack" ? "Slack" : "Discord";

        if (!activeUrl) {
            setWebhookStatus("error");
            setWebhookMessage(
                `Configure ${platformName} webhook URL in Settings first`,
            );
            setTimeout(() => {
                setWebhookStatus("idle");
                setWebhookMessage("");
            }, 3500);
            onOpenSettings?.();
            return;
        }

        if (taskLogs.length === 0) {
            setWebhookStatus("error");
            setWebhookMessage("No completed tasks to send");
            setTimeout(() => {
                setWebhookStatus("idle");
                setWebhookMessage("");
            }, 3000);
            return;
        }

        setWebhookStatus("sending");
        setWebhookMessage("");

        const success = await sendDailyLogToWebhook(
            activeUrl,
            settings.webhookPlatform,
            taskLogs,
        );

        if (success) {
            setWebhookStatus("success");
            setWebhookMessage(`${platformName} logs dispatched successfully!`);
            setTimeout(() => {
                setWebhookStatus("idle");
                setWebhookMessage("");
            }, 3000);
        } else {
            setWebhookStatus("error");
            setWebhookMessage(
                `Failed to dispatch to ${platformName}. Check URL and CORS.`,
            );
            setTimeout(() => {
                setWebhookStatus("idle");
                setWebhookMessage("");
            }, 3500);
        }
    };

    return (
        <div
            className={clsx(
                "flex flex-col gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-slate-800/80 shadow-md backdrop-blur-sm",
                className,
            )}
        >
            {/* Header with Title and Summary */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-emerald-400 shrink-0" />
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                        Work Log History
                    </h3>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono shrink-0">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{totalMinutes}m focused</span>
                    <span>•</span>
                    <span>{taskLogs.length} tasks</span>
                </div>
            </div>

            {/* Destination Selector & Webhook Quick Edit */}
            <div className="flex items-center justify-between text-xs px-0.5">
                <span className="text-[11px] font-medium text-slate-400">
                    Webhook Destination:
                </span>
                <div className="flex items-center gap-1 bg-zinc-950/80 p-0.5 rounded-lg border border-slate-800">
                    <button
                        type="button"
                        onClick={() => handleSwitchPlatform("discord")}
                        className={clsx(
                            "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                            settings.webhookPlatform === "discord"
                                ? "bg-indigo-950 text-indigo-300 border border-indigo-500/40 shadow-sm"
                                : "text-slate-400 hover:text-slate-200",
                        )}
                    >
                        Discord
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSwitchPlatform("slack")}
                        className={clsx(
                            "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                            settings.webhookPlatform === "slack"
                                ? "bg-amber-950 text-amber-300 border border-amber-500/40 shadow-sm"
                                : "text-slate-400 hover:text-slate-200",
                        )}
                    >
                        Slack
                    </button>
                    <button
                        type="button"
                        onClick={onOpenSettings}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-zinc-800 transition-all cursor-pointer ml-0.5"
                        title="Configure Webhook URLs & Settings"
                        aria-label="Edit Webhook Settings"
                    >
                        <Settings2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Action Buttons: Copy Markdown & Send Webhook */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyMarkdown}
                    disabled={taskLogs.length === 0}
                    className="w-full sm:flex-1 text-xs justify-center"
                >
                    {copySuccess ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Markdown</span>
                        </>
                    )}
                </Button>

                <div className="flex items-center gap-1.5 w-full sm:flex-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSendWebhook}
                        disabled={
                            webhookStatus === "sending" || taskLogs.length === 0
                        }
                        isLoading={webhookStatus === "sending"}
                        className="flex-1 text-xs border-slate-700/80 hover:border-emerald-500/50 justify-center"
                    >
                        {webhookStatus === "success" ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Dispatched</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-3.5 h-3.5 text-slate-300" />
                                <span>
                                    Send{" "}
                                    {settings.webhookPlatform === "slack"
                                        ? "Slack"
                                        : "Discord"}
                                </span>
                            </>
                        )}
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onOpenSettings}
                        className="px-2 text-xs border-slate-700/80 hover:border-slate-500 text-slate-300 hover:text-white shrink-0"
                        title="Edit Webhook Settings (Change URL or Platform)"
                        aria-label="Edit Webhook Settings"
                    >
                        <Settings2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {/* Feedback banner for Webhook error / info */}
            {webhookMessage ? (
                <div
                    className={clsx(
                        "flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium border transition-all",
                        webhookStatus === "error"
                            ? "bg-red-950/40 text-red-300 border-red-500/30"
                            : "bg-emerald-950/40 text-emerald-300 border-emerald-500/30",
                    )}
                >
                    {webhookStatus === "error" ? (
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    ) : (
                        <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                    )}
                    <span>{webhookMessage}</span>
                </div>
            ) : null}

            {/* List of completed items */}
            <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
                {taskLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl bg-zinc-950/40 border border-slate-800/60 text-slate-500">
                        <ListTodo className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
                        <p className="text-xs font-medium text-slate-400">
                            No sessions completed yet.
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                            Start your first Pomodoro session to log your
                            productivity automatically.
                        </p>
                    </div>
                ) : (
                    taskLogs.map((log) => (
                        <WorkLogItem
                            key={log.id}
                            item={log}
                            onDelete={deleteLog}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
