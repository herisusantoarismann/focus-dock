````markdown
# AGENT SPECIFICATION: FOCUSDOCK

You are an expert Staff Frontend Engineer. Build **FocusDock**, a local-first Pomodoro workspace with native Document Picture-in-Picture (PiP), Web Audio API sound synthesis, and automatic work-logging.

---

## 1. TECH STACK & SYSTEM CONSTRAINTS

- **Framework**: Next.js 16 (App Router), React 19, TypeScript (Strict, 0 `any` types).
- **Styling**: Tailwind CSS (Dark theme: slate-900, zinc-950, emerald-500, amber-500).
- **State**: Zustand with Immer (`src/stores/useFocusStore.ts`).
- **Storage**: Local IndexedDB via `idb-keyval`. No external database, no paid APIs.
- **Client Execution**: All UI components and hooks MUST use `'use client'`.

---

## 2. DATA CONTRACT (`src/types/focus.ts`)

```typescript
export type SessionMode = "focus" | "shortBreak" | "longBreak";
export type TimerStatus = "idle" | "running" | "paused";
export type WebhookPlatform = "discord" | "slack";

export interface TaskLogItem {
    id: string;
    title: string;
    durationMinutes: number;
    completedAt: string; // ISO string
}

export interface SoundState {
    rainVolume: number; // 0 - 1
    cafeVolume: number; // 0 - 1
    keyboardVolume: number; // 0 - 1
    isMuted: boolean;
}

export interface SettingsState {
    focusDuration: number; // in seconds (default 1500)
    shortBreakDuration: number; // in seconds (default 300)
    longBreakDuration: number; // in seconds (default 900)
    webhookUrl: string;
    webhookPlatform: WebhookPlatform;
}
```
````

---

## 3. STORE INTERFACE (`src/stores/useFocusStore.ts`)

```typescript
export interface FocusStore {
    // Timer State
    status: TimerStatus;
    mode: SessionMode;
    timeLeft: number;
    completedPomodoros: number;

    // Task & Intent
    currentIntent: string;
    taskLogs: TaskLogItem[];

    // Audio & Settings
    audio: SoundState;
    settings: SettingsState;

    // Actions
    setIntent: (text: string) => void;
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    tick: () => void;
    completeSession: () => void;
    skipBreak: () => void;
    setAudioVolume: (
        key: keyof Omit<SoundState, "isMuted">,
        value: number,
    ) => void;
    toggleMute: () => void;
    updateSettings: (newSettings: Partial<SettingsState>) => void;
    deleteLog: (id: string) => void;
    hydrateFromIDB: () => Promise<void>;
}
```

---

## 4. ATOMIC COMPONENT HIERARCHY

### Atoms (`src/components/atoms/`)

1. `Badge.tsx`: Visual tag for active mode (`focus` = emerald, `break` = amber).
2. `Button.tsx`: Variants (`primary`, `outline`, `ghost`, `danger`) with active press states.
3. `CircularProgress.tsx`: Clean SVG ring. Formula: `strokeDashoffset = circumference - (progress * circumference)`.
4. `FormInput.tsx`: High-contrast input field with autofocus and clear button.
5. `Slider.tsx`: Custom range slider for audio volumes.

### Molecules (`src/components/molecules/`)

1. `IntentInputBar.tsx`: Input field locked while timer is running. Shows shortcut hint `[Enter]`.
2. `AudioMixerTrack.tsx`: Volume slider, label, and mute toggle for a single audio source.
3. `MicroBreakCard.tsx`: Displays 20-20-20 break prompt. Disables "Skip" button for 5 seconds using local `countdown` state.
4. `PiPControls.tsx`: Minified Play/Pause, Skip, and Complete buttons for the PiP window.
5. `WorkLogItem.tsx`: Single completed item with timestamp, duration badge, and delete button.

### Organisms (`src/components/organisms/`)

1. `TimerWorkspace.tsx`: Central module containing CircularProgress, mode badges, and play/pause controls.
2. `FloatingPipView.tsx`: Lightweight view (320x160px) rendered inside `documentPictureInPicture` via React Portal.
3. `AmbientAudioPanel.tsx`: Mixer panel holding 3 `AudioMixerTrack` instances + master mute.
4. `WorkLogFeed.tsx`: Task history with "Copy Markdown" and "Send Webhook" buttons.
5. `SettingsWebhookModal.tsx`: Modal configuring durations and Discord/Slack webhook URLs.

### Templates (`src/components/templates/`)

1. `DashboardTemplate.tsx`: Responsive 2-column layout (Left: Timer + Audio; Right: Intent + Work Logs).

---

## 5. CORE LOGIC SPECIFICATIONS

### A. Document Picture-in-Picture (`src/hooks/useDocumentPiP.ts`)

- Check `if ('documentPictureInPicture' in window)`.
- On trigger: `const pipWindow = await window.documentPictureInPicture.requestWindow({ width: 340, height: 180 });`.
- Clone styles:

```typescript
[...document.styleSheets].forEach((styleSheet) => {
    try {
        const cssRules = [...styleSheet.cssRules]
            .map((r) => r.cssText)
            .join("");
        const style = document.createElement("style");
        style.textContent = cssRules;
        pipWindow.document.head.appendChild(style);
    } catch {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = styleSheet.href!;
        pipWindow.document.head.appendChild(link);
    }
});
```

- Render `FloatingPipView` into `pipWindow.document.body` via `createPortal`.
- Bind `pipWindow.addEventListener('pagehide', () => setIsPipOpen(false))`.

### B. Procedural Audio Engine (`src/hooks/useProceduralAudio.ts`)

- Zero external audio files. 100% Web Audio API.
- Initialize `AudioContext` only on first user interaction to bypass autoplay restrictions.
- **Pink Noise (Rain)**: Buffer filled with random white noise passed through a `BiquadFilterNode` (type: 'lowpass', frequency: 700Hz).
- **Cafe Sound**: White noise passed through a bandpass filter (center: 600Hz, Q: 2.0).
- **Key Clicks**: Short bursts of sinusoidal oscillation (frequency: 1800Hz, duration: 15ms) triggered at random 150-400ms intervals.
- Connect each channel to its own `GainNode`, connected to a `masterGainNode`.
- Fade out audio automatically when `timeLeft <= 10`.

### C. Webhook Dispatcher (`src/lib/webhookService.ts`)

```typescript
export async function sendDailyLogToWebhook(
    url: string,
    platform: "discord" | "slack",
    logs: TaskLogItem[],
): Promise<boolean> {
    const content = logs
        .map((l) => `• ${l.title} (${l.durationMinutes}m)`)
        .join("\n");
    const payload =
        platform === "discord"
            ? { content: `**FocusDock Log**\n${content}` }
            : { text: `*FocusDock Log*\n${content}` };

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return res.ok;
}
```

---

## 6. STRICT IMPLEMENTATION RULES

1. **No Stubs / No TODOs**: Implement complete functions. Do not leave placeholder comments.
2. **Hydration Protection**: Never read `idb-keyval` directly in the component render phase. Always trigger read actions inside a client `useEffect`.
3. **Keyboard Shortcuts**:

- `Space`: Toggle Start/Pause (prevent default scroll).
- `Ctrl/Cmd + Enter`: Complete active task early.
- `Alt + P`: Open/Close Picture-in-Picture window.

```

```
