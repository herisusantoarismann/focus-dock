# 🚀 FocusDock User Onboarding & Handbook

Welcome to **FocusDock** — your distraction-free desktop Pomodoro companion designed for developers and deep-focus professionals.

This guide walks you through setting up FocusDock, mastering the Picture-in-Picture workflow, configuring ambient audio, and syncing daily work logs.

---

## 📌 Table of Contents

1. [Core Philosophy](#1-core-philosophy)
2. [Quick Walkthrough](#2-quick-walkthrough)
3. [Document Picture-in-Picture (PiP) Workflow](#3-document-picture-in-picture-pip-workflow)
4. [Audio Engine: Ambient vs. Chime Only](#4-audio-engine-ambient-vs-chime-only)
5. [Work Logging & Webhook Integrations](#5-work-logging--webhook-integrations)
6. [Desktop Notifications & Permissions](#6-desktop-notifications--permissions)
7. [Keyboard Shortcuts Cheat Sheet](#7-keyboard-shortcuts-cheat-sheet)
8. [Frequently Asked Questions (FAQ)](#8-frequently-asked-questions-faq)

---

## 1. Core Philosophy

Traditional Pomodoro apps often suffer from two extremes:

1. **Too intrusive**: Full-screen blockers that disrupt terminal and IDE workflows.
2. **Too hidden**: Ordinary browser tabs that get buried beneath twenty other tabs.

FocusDock solves this using the **W3C Document Picture-in-Picture API**. It creates an always-on-top floating mini-widget that remains visible while you write code in VS Code, inspect logs in a terminal, or review pull requests.

Everything is **local-first**:

- Your tasks and preferences are stored exclusively in your browser's **IndexedDB**.
- All sounds are generated procedurally on-the-fly using the **Web Audio API** — no audio files are downloaded.
- Zero tracking scripts, zero subscriptions, zero account logins required.

---

## 2. Quick Walkthrough

### Step 1: Set Your Single-Task Intent

Before you can start a focus sprint, define what you intend to accomplish:

- Example: `Implement JWT authentication middleware`
- Press `Enter` to lock in your intent and start the timer immediately.
- _Why?_ Enforcing intent eliminates wandering focus and ensures your work log accurately reflects what you achieved.

### Step 2: Choose Your Audio Experience

- **Ambient Soundscapes**: Mix procedural Rain, Cafe hum, and Mechanical Keyboard clicks to mask environmental distractions.
- **Chime Only**: Listening to Spotify or a podcast? Select Chime Only. Ambient noise will be muted, and only the gentle completion bell will sound when time is up.

### Step 3: Pop Out the Floating PiP Controller

- Press **`Alt + P`** or click the **PiP** button in the top navigation.
- A compact `320x160px` floating window will appear on top of all your applications.
- You can play, pause, or complete tasks early without switching away from your editor.

### Step 4: Take Your 20-20-20 Micro Break

- When the timer ends, a crystalline bell chime plays, confetti bursts, and FocusDock transitions to break mode.
- Use the **Micro-Break Card** to rest your eyes: _Look at an object 20 feet away for 20 seconds_.
- After 4 completed focus sprints, FocusDock automatically schedules an extended **15-minute Long Break**.

---

## 3. Document Picture-in-Picture (PiP) Workflow

### Browser Compatibility

Document Picture-in-Picture is supported on **Google Chrome** (v116+) and **Microsoft Edge** (v116+).

### Multi-Monitor Setup Tips

- You can drag the floating PiP window to any position or secondary monitor.
- Chromium remembers the last position of the PiP window. If you position it at the top-center or top-right of your coding monitor, it will appear there automatically in future sessions.
- **Keyboard Shortcut**: Press `Alt + P` at any time to open or close the PiP window instantly.

---

## 4. Audio Engine: Ambient vs. Chime Only

FocusDock generates sounds mathematically using the Web Audio API without consuming network bandwidth:

| Sound Source   | Technology                                        | Description                                                                      |
| :------------- | :------------------------------------------------ | :------------------------------------------------------------------------------- |
| **Rain**       | Multi-pole Low-Pass Biquad (600Hz, Q: 0.5)        | Soft, steady continuous rainfall to drown out background chatter.                |
| **Cafe Hum**   | Dual Bandpass (300Hz & 800Hz) + 0.2Hz LFO         | Brownian noise simulating the warm, distant murmur of a coffee shop.             |
| **Key Clicks** | 2200Hz Bandpass Noise Burst (25ms decay)          | Tactile mechanical switch transients occurring at realistic 150-400ms intervals. |
| **Bell Chime** | Harmonic Sine Chord (528Hz, 660Hz, 792Hz, 1056Hz) | Resonant, Tibetan/cathedral-style bell chime with 2.4s exponential decay.        |

### Testing Sounds Before Your Sprint

Click the **Test Audio** button in the Audio Engine panel to preview your mix before starting the timer.

---

## 5. Work Logging & Webhook Integrations

### Accurate Time Tracking

FocusDock measures your actual time spent:

- **Full Session**: `• ✅ [COMPLETED] Task Name — 25m (Full Session) [10:30 AM]`
- **Early Finish**: `• ⚠️ [EARLY FINISH] Task Name — 14m of 25m target [11:15 AM]`
- **Spam Prevention**: Accidental clicks under 20 seconds are automatically discarded.

### Setting Up Discord Webhooks

1. In Discord, go to **Server Settings** > **Integrations** > **Webhooks**.
2. Click **New Webhook**, select your channel (e.g. `#daily-standup`), and click **Copy Webhook URL**.
3. In FocusDock, click **Settings (⚙️)**, select **Discord**, and paste your URL.
4. In the Work Log feed, click **Send Webhook** to publish your daily log.

### Setting Up Slack Webhooks

1. In Slack, go to **Incoming Webhooks** in your App Directory.
2. Select your channel and copy the Webhook URL (format: `https://hooks.slack.com/services/...`).
3. In FocusDock Settings, choose **Slack** and paste the URL.
4. FocusDock includes a built-in server proxy (`/api/webhook`) to bypass Slack's browser preflight CORS restrictions seamlessly.

---

## 6. Desktop Notifications & Permissions

To receive notifications when working in other desktop applications:

1. When prompted by your browser, click **Allow** for Notifications.
2. If missed, click the lock/tune icon next to the URL bar in Chrome/Edge, and set **Notifications** to **Allow**.
3. When each focus sprint or break ends, a native OS notification banner will appear.

---

## 7. Keyboard Shortcuts Cheat Sheet

| Key Combination                | Action              | Notes                                                     |
| :----------------------------- | :------------------ | :-------------------------------------------------------- |
| `Space`                        | Start / Pause Timer | Disabled when typing inside text inputs.                  |
| `Ctrl + Enter` / `Cmd + Enter` | Complete Task Early | Immediately logs actual minutes elapsed and starts break. |
| `Alt + P`                      | Toggle PiP Window   | Pops out or docks the floating widget.                    |
| `Enter`                        | Commit Task Intent  | Starts sprint when focus input is active.                 |

---

## 8. Frequently Asked Questions (FAQ)

#### Q: Can the PiP window open automatically when the timer reaches 00:00?

> **A:** For security reasons, modern browsers (Chromium) require a direct user click/gesture to open a new Picture-in-Picture window. To avoid this limitation, press **`Alt + P`** at the beginning of your work day so your PiP dock is already floating above your windows. When time is up, it will automatically switch to break mode with celebration banners.

#### Q: Where is my data stored?

> **A:** All settings, audio volumes, session counts, and work logs are stored locally in your browser's IndexedDB. No data is ever uploaded to external servers.

#### Q: Can I use FocusDock offline?

> **A:** Yes! Once loaded, FocusDock requires no internet connection to run timers, synthesize procedural audio, or record work logs. An internet connection is only needed if you dispatch webhooks to Discord or Slack.
