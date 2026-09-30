# 🎯 FocusDock

> **FocusDock** is a local-first, distraction-free desktop Pomodoro workspace featuring native **Document Picture-in-Picture (PiP)**, 100% **procedural Web Audio sound synthesis**, and automatic work-logging with Discord/Slack webhook synchronization.

Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS**, and **Zustand with Immer**. Zero external databases, zero paid APIs, zero tracking.

---

## ✨ Key Features

- 📌 **Enforced Task Intent**: Eliminates aimless work sprints. You cannot start a focus session without specifying what you are working on.
- 🪟 **Native Document Picture-in-Picture (PiP)**: Pop out an interactive mini floating controller (`320x160px`) via React Portal that stays on top of all your desktop windows (code editors, browsers, terminals).
- 🔊 **Procedural Web Audio Engine**: Zero external audio files or MP3 downloads.
    - **Soft Rain**: Multi-pole low-pass biquad filters (~600Hz, Q: 0.5) over white noise.
    - **Cafe Ambience**: Brownian noise through dual bandpass filters (~300Hz and ~800Hz) modulated by a slow 0.2Hz LFO for realistic room warmth.
    - **Mechanical Clicks**: Transient 2200Hz bandpass noise bursts (25ms) simulating tactile mechanical keyboard switches.
    - **Harmonic Bell Chime**: Resonant multi-overtone bell chord (528Hz fundamental, 660Hz fifth, 792Hz octave-third, 1056Hz shimmer, 264Hz sub-octave warmth) with exponential decay that triggers when your session ends.
- 🎧 **Audio Mode Selector**:
    - **Ambient Soundscapes**: Mix Rain, Cafe, and Keyboard sounds with individual volume sliders.
    - **Chime Only / External Music**: Silences ambient noise for users listening to their own Spotify, Apple Music, or YouTube playlists while keeping the gentle completion bell armed.
- ⏱️ **Accurate Work-Logging**: Tracks actual elapsed minutes vs target minutes, automatically tagging `[COMPLETED] (Full Session)` or `[EARLY FINISH] (e.g. 12m of 25m target)`. Accidental clicks (<20 seconds) are automatically ignored.
- ☕ **20-20-20 Micro-Break Support**: Visual eye-strain prompt with a 5-second countdown protection to encourage taking breaks.
- 📡 **Webhook Dispatcher (Discord & Slack)**: Send your completed daily log to your team channel with one click, backed by a Next.js server-side API proxy to bypass browser CORS limitations.
- 📋 **Markdown Exporter**: Copy formatted daily work logs straight to your clipboard.
- 🏷️ **Dynamic Favicon & Title Bar**: Live circular SVG progress arc in your browser tab icon and real-time MM:SS countdown in the window title.
- 💾 **Local-First Persistence**: IndexedDB via `idb-keyval` stores your settings, audio levels, task history, and session counts entirely on your machine.

---

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/herisusantoarismann/focus-dock.git
cd focusdock

# Install dependencies
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser (Google Chrome or Microsoft Edge recommended for Document Picture-in-Picture support).

### 3. Run Automated Tests

FocusDock comes with an automated Vitest test suite covering focus cycles, audio synthesis, and webhook dispatches:

```bash
npm test
```

### 4. Build for Production

```bash
npm run build
npm start
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut                       | Action                                                       |
| :----------------------------- | :----------------------------------------------------------- |
| `Space`                        | Toggle Start / Pause timer (prevents default page scrolling) |
| `Ctrl + Enter` / `Cmd + Enter` | Complete active task early and log work                      |
| `Alt + P`                      | Toggle Document Picture-in-Picture (PiP) window              |
| `Enter` (in Intent field)      | Commit intent and start sprint                               |

---

## 🧭 Step-by-Step Onboarding Guide

### Step 1: Set Your Task Intent

Type what you want to achieve into the **Task Intent** bar (e.g., `"Refactor Authentication Middleware"`). FocusDock locks this input while the timer is running to keep your attention on one goal.

### Step 2: Choose Your Audio Mode

- If you like background ambient noise: Select **Ambient Soundscapes** and adjust the Rain, Cafe, or Keyboard sliders. Click **Test Audio** to preview your sound mix.
- If you prefer Spotify / Apple Music / YouTube: Switch to **Chime Only**. Ambient sounds will stay silent, and FocusDock will only chime when your sprint is done.

### Step 3: Open Picture-in-Picture (`Alt + P`)

Click the **PiP** button in the header or press `Alt + P`. Move the floating mini-window to any corner or secondary monitor. You can play, pause, or finish early right from the PiP window while keeping your code editor full-screen.

### Step 4: Finish & Celebrate

When the countdown hits `00:00` (or you click complete early):

- The harmonic bell chime will ring.
- A celebratory confetti burst appears on your dashboard.
- A native desktop notification toast pops up.
- FocusDock automatically logs your elapsed time and switches to **Short Break** mode (or **Long Break** every 4 sessions).

### Step 5: Sync to Discord or Slack

Open the **Work Log** panel and click **Send Webhook** or **Copy Markdown** to share your accomplishments with your team.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router), React 19, TypeScript (Strict, 0 `any` types).
- **Styling**: Tailwind CSS v4 (Zinc & Slate dark theme with Emerald and Amber accents).
- **State Management**: Zustand with Immer (`src/stores/useFocusStore.ts`).
- **Storage**: IndexedDB (`idb-keyval`) for local-first zero-latency storage.
- **Audio**: Web Audio API (`AudioContext`, `BiquadFilterNode`, `GainNode`, `OscillatorNode`).
- **Testing**: Vitest with unit & integration test coverage (`test/focusCycle.test.ts`, `test/audio.test.ts`, `test/webhook.test.ts`).

---

## 📄 License

MIT © FocusDock Contributors. Free and open source.
