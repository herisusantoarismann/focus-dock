/**
 * Format total seconds into MM:SS display string.
 * Clamps negative numbers to 00:00.
 */
export function formatTime(totalSeconds: number): string {
    if (isNaN(totalSeconds) || totalSeconds <= 0) {
        return "00:00";
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Format duration in minutes to compact badge string, e.g. "25m".
 */
export function formatDuration(durationMinutes: number): string {
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
        return "0m";
    }
    return `${Math.round(durationMinutes)}m`;
}

/**
 * Format an ISO date string into human-readable local time / date.
 * If date is today, displays "Today, HH:MM".
 * Otherwise displays "MMM D, HH:MM".
 */
export function formatCompletedAt(isoString: string): string {
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) {
            return isoString;
        }

        const now = new Date();
        const isToday =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        };
        const timeStr = date.toLocaleTimeString(undefined, timeOptions);

        if (isToday) {
            return `Today, ${timeStr}`;
        }

        const dateOptions: Intl.DateTimeFormatOptions = {
            month: "short",
            day: "numeric",
        };
        const dateStr = date.toLocaleDateString(undefined, dateOptions);

        return `${dateStr}, ${timeStr}`;
    } catch {
        return isoString;
    }
}

/**
 * Generates current ISO timestamp.
 */
export function getNowISO(): string {
    return new Date().toISOString();
}
