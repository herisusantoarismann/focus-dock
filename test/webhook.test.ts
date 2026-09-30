import { describe, it, expect, beforeEach, vi } from "vitest";
import {
    sendDailyLogToWebhook,
    generateMarkdownLogs,
} from "@/lib/webhookService";
import { TaskLogItem } from "@/types/focus";

describe("FocusDock - Webhook Service & Markdown Exporter", () => {
    const mockLogs: TaskLogItem[] = [
        {
            id: "task-1",
            title: "Build PiP Floating Controller",
            durationMinutes: 25,
            targetMinutes: 25,
            isEarlyFinish: false,
            completedAt: "2026-09-30T10:00:00.000Z",
        },
        {
            id: "task-2",
            title: "Fix Audio Synthesis Filter",
            durationMinutes: 12,
            targetMinutes: 25,
            isEarlyFinish: true,
            completedAt: "2026-09-30T11:30:00.000Z",
        },
    ];

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("generates markdown logs correctly formatting full session and early finish items", () => {
        const md = generateMarkdownLogs(mockLogs);

        expect(md).toContain("### FocusDock Work Log");
        expect(md).toContain(
            "✅ [COMPLETED] Build PiP Floating Controller — 25m (Full Session)",
        );
        expect(md).toContain(
            "⚠️ [EARLY FINISH] Fix Audio Synthesis Filter — 12m of 25m target",
        );
    });

    it("handles empty logs gracefully in markdown generation", () => {
        const md = generateMarkdownLogs([]);
        expect(md).toContain("No completed tasks recorded.");
    });

    it("returns false if webhook url is empty", async () => {
        const res = await sendDailyLogToWebhook("", "discord", mockLogs);
        expect(res).toBe(false);
    });

    it("dispatches Discord webhook payload correctly via proxy", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
        });
        global.fetch = fetchMock;

        const success = await sendDailyLogToWebhook(
            "https://discord.com/api/webhooks/123/abc",
            "discord",
            mockLogs,
        );

        expect(success).toBe(true);
        expect(fetchMock).toHaveBeenCalledTimes(1);

        const [calledUrl, calledInit] = fetchMock.mock.calls[0];
        expect(calledUrl).toBe("/api/webhook");
        const body = JSON.parse(calledInit.body as string);
        expect(body.platform).toBe("discord");
        expect(body.payload.content).toContain("**FocusDock Log**");
        expect(body.payload.content).toContain("Build PiP Floating Controller");
        expect(body.payload.content).toContain("Fix Audio Synthesis Filter");
    });

    it("dispatches Slack webhook payload with mrkdwn text", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
        });
        global.fetch = fetchMock;

        const success = await sendDailyLogToWebhook(
            "https://hooks.slack.com/services/T00/B00/X00",
            "slack",
            mockLogs,
        );

        expect(success).toBe(true);
        const [, calledInit] = fetchMock.mock.calls[0];
        const body = JSON.parse(calledInit.body as string);
        expect(body.platform).toBe("slack");
        expect(body.payload.text).toContain("*FocusDock Log*");
    });

    it("falls back to direct client fetch if proxy fails", async () => {
        // First call (/api/webhook) fails, second call (direct url) succeeds
        const fetchMock = vi
            .fn()
            .mockRejectedValueOnce(new Error("Proxy network failure"))
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
            });
        global.fetch = fetchMock;

        const success = await sendDailyLogToWebhook(
            "https://discord.com/api/webhooks/123/abc",
            "discord",
            mockLogs,
        );

        expect(success).toBe(true);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock.mock.calls[1][0]).toBe(
            "https://discord.com/api/webhooks/123/abc",
        );
    });
});
