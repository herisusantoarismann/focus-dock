import { TaskLogItem, WebhookPlatform } from "@/types/focus";

function formatTaskLogLine(l: TaskLogItem): string {
    const target = l.targetMinutes || l.durationMinutes;
    let timeStr = "";
    try {
        const d = new Date(l.completedAt);
        if (!isNaN(d.getTime())) {
            timeStr = d.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        }
    } catch {
        timeStr = "";
    }
    const timeFormatted = timeStr ? ` [${timeStr}]` : "";

    if (l.isEarlyFinish) {
        return `• ⚠️ [EARLY FINISH] ${l.title} — ${l.durationMinutes}m of ${target}m target${timeFormatted}`;
    }

    return `• ✅ [COMPLETED] ${l.title} — ${l.durationMinutes}m (Full Session)${timeFormatted}`;
}

export async function sendDailyLogToWebhook(
    url: string,
    platform: WebhookPlatform,
    logs: TaskLogItem[],
): Promise<boolean> {
    if (!url || !url.trim()) {
        return false;
    }

    const content =
        logs.length > 0
            ? logs.map(formatTaskLogLine).join("\n")
            : "No completed tasks recorded.";

    const payload =
        platform === "discord"
            ? { content: `**FocusDock Log**\n${content}` }
            : { text: `*FocusDock Log*\n${content}` };

    // 1. Send via internal Next.js API route proxy (bypasses browser CORS for Slack & Discord)
    try {
        const proxyRes = await fetch("/api/webhook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                url: url.trim(),
                platform,
                payload,
            }),
        });

        if (proxyRes.ok) {
            return true;
        }
    } catch {
        // Fallback if proxy endpoint is unreachable
    }

    // 2. Direct client-side fetch fallback
    try {
        const res = await fetch(url.trim(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        return res.ok;
    } catch (error) {
        console.error("Failed to send webhook log:", error);
        return false;
    }
}

export function generateMarkdownLogs(logs: TaskLogItem[]): string {
    if (logs.length === 0) {
        return "### FocusDock Work Log\n\nNo completed tasks recorded.";
    }

    const dateHeader = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const lines = logs.map(formatTaskLogLine);

    return `### FocusDock Work Log (${dateHeader})\n\n${lines.join("\n")}`;
}
