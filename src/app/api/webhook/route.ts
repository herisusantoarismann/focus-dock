import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as {
            url?: string;
            platform?: string;
            payload?: Record<string, unknown>;
        };

        const { url, payload } = body;

        if (!url || typeof url !== "string") {
            return NextResponse.json(
                { error: "Webhook URL is required" },
                { status: 400 },
            );
        }

        // Validate URL format
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(url);
        } catch {
            return NextResponse.json(
                { error: "Invalid Webhook URL format" },
                { status: 400 },
            );
        }

        if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
            return NextResponse.json(
                { error: "Webhook URL must use HTTP or HTTPS protocol" },
                { status: 400 },
            );
        }

        // Forward request server-side (bypasses browser CORS policy for Slack & Discord)
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload ?? {}),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            return NextResponse.json(
                {
                    error: `Webhook provider responded with status ${response.status}: ${errorText}`,
                },
                { status: response.status },
            );
        }

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
