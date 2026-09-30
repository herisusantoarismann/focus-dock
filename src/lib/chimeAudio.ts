let sharedAudioCtx: AudioContext | null = null;

/**
 * Returns a singleton AudioContext instance safely in the browser.
 */
export function getSharedAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
        const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
                .webkitAudioContext;

        if (AudioContextClass) {
            sharedAudioCtx = new AudioContextClass();
        }
    }

    return sharedAudioCtx;
}

/**
 * Synthesizes a resonant, crystalline Pomodoro bell chime via Web Audio API.
 * Uses harmonic overtones (528Hz fundamental, 660Hz fifth, 792Hz octave-third, 1056Hz harmonic overtone)
 * with exponential decay to clearly signal session completion.
 * Waits for AudioContext.resume() so it never drops audio when suspended.
 */
export function playCompletionChime(): void {
    if (typeof window === "undefined") return;

    try {
        const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
                .webkitAudioContext;

        if (!AudioContextClass) return;

        let ctx = getSharedAudioContext();
        if (!ctx || ctx.state === "closed") {
            ctx = new AudioContextClass();
            sharedAudioCtx = ctx;
        }

        const triggerSound = (activeCtx: AudioContext) => {
            const now = activeCtx.currentTime;
            const duration = 2.4;

            // Master alert gain node (independent of ambient background tracks)
            const alertMasterGain = activeCtx.createGain();
            alertMasterGain.gain.setValueAtTime(0.65, now);
            alertMasterGain.connect(activeCtx.destination);

            // Rich resonant bell chord (fundamental, fifth, octave, and sparkle)
            const tones = [
                { freq: 528, start: 0, peak: 0.5, decay: duration },
                { freq: 660, start: 0.08, peak: 0.45, decay: duration },
                { freq: 792, start: 0.18, peak: 0.35, decay: duration - 0.2 },
                { freq: 1056, start: 0.03, peak: 0.25, decay: 1.2 },
                { freq: 264, start: 0, peak: 0.2, decay: duration }, // sub-octave warmth
            ];

            tones.forEach(({ freq, start, peak, decay }) => {
                const startTime = now + start;
                const osc = activeCtx.createOscillator();
                const gain = activeCtx.createGain();

                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0.0001, startTime);
                gain.gain.linearRampToValueAtTime(peak, startTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(
                    0.0001,
                    startTime + decay,
                );

                osc.connect(gain);
                gain.connect(alertMasterGain);

                osc.start(startTime);
                osc.stop(startTime + decay + 0.05);
            });
        };

        if (ctx.state === "suspended") {
            ctx.resume()
                .then(() => {
                    triggerSound(ctx!);
                })
                .catch((e) => {
                    console.warn("AudioContext resume failed:", e);
                });
        } else {
            triggerSound(ctx);
        }
    } catch (err) {
        console.error("Failed to synthesize completion chime:", err);
    }
}
