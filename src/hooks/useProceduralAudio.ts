"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useFocusStore } from "@/stores/useFocusStore";
import { getSharedAudioContext, playCompletionChime } from "@/lib/chimeAudio";

export { playCompletionChime };

interface AudioNodes {
    ctx: AudioContext;
    masterGain: GainNode;
    rainGain: GainNode;
    cafeGain: GainNode;
    keyboardGain: GainNode;
    rainSource: AudioBufferSourceNode;
    cafeSource: AudioBufferSourceNode;
    lfo: OscillatorNode;
}

export function useProceduralAudio() {
    const audioState = useFocusStore((state) => state.audio);
    const timerStatus = useFocusStore((state) => state.status);
    const timeLeft = useFocusStore((state) => state.timeLeft);
    const isAudioPreviewing = useFocusStore((state) => state.isAudioPreviewing);

    const [isInitialized, setIsInitialized] = useState(false);
    const nodesRef = useRef<AudioNodes | null>(null);
    const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Generate White Noise Buffer
    const createWhiteNoiseBuffer = useCallback(
        (ctx: AudioContext, seconds = 4): AudioBuffer => {
            const bufferSize = ctx.sampleRate * seconds;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            return buffer;
        },
        [],
    );

    // Generate Brownian Noise Buffer (integrated noise for soft room ambience)
    const createBrownianNoiseBuffer = useCallback(
        (ctx: AudioContext, seconds = 4): AudioBuffer => {
            const bufferSize = ctx.sampleRate * seconds;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            let lastOut = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                lastOut = (lastOut + 0.02 * white) / 1.02;
                data[i] = lastOut * 3.5; // Gain compensation
            }
            return buffer;
        },
        [],
    );

    // Explicit Audio Initialization / Resume: ONLY on user interaction
    const initAudio = useCallback(() => {
        if (typeof window === "undefined") return;

        if (nodesRef.current) {
            if (nodesRef.current.ctx.state === "suspended") {
                void nodesRef.current.ctx.resume();
            }
            return;
        }

        try {
            const ctx = getSharedAudioContext();
            if (!ctx) return;

            // Master Gain
            const masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(0, ctx.currentTime);
            masterGain.connect(ctx.destination);

            // --- 1. RAIN RECIPE ---
            // Multi-pole low-pass biquad filters (cutoff ~600Hz, Q: 0.5) over white noise
            const rainBuffer = createWhiteNoiseBuffer(ctx, 4);
            const rainSource = ctx.createBufferSource();
            rainSource.buffer = rainBuffer;
            rainSource.loop = true;

            // Pole 1: 600Hz Lowpass
            const rainFilter1 = ctx.createBiquadFilter();
            rainFilter1.type = "lowpass";
            rainFilter1.frequency.setValueAtTime(600, ctx.currentTime);
            rainFilter1.Q.setValueAtTime(0.5, ctx.currentTime);

            // Pole 2: 600Hz Lowpass (24dB/octave slope for soft rain rumble)
            const rainFilter2 = ctx.createBiquadFilter();
            rainFilter2.type = "lowpass";
            rainFilter2.frequency.setValueAtTime(600, ctx.currentTime);
            rainFilter2.Q.setValueAtTime(0.5, ctx.currentTime);

            const rainGain = ctx.createGain();
            rainGain.gain.setValueAtTime(
                audioState.rainVolume,
                ctx.currentTime,
            );

            rainSource.connect(rainFilter1);
            rainFilter1.connect(rainFilter2);
            rainFilter2.connect(rainGain);
            rainGain.connect(masterGain);
            rainSource.start(0);

            // --- 2. CAFE AMBIENCE RECIPE ---
            // Brownian Noise through dual bandpass (~300Hz and ~800Hz) modulated by 0.2Hz LFO
            const brownianBuffer = createBrownianNoiseBuffer(ctx, 4);
            const cafeSource = ctx.createBufferSource();
            cafeSource.buffer = brownianBuffer;
            cafeSource.loop = true;

            const cafeBand1 = ctx.createBiquadFilter();
            cafeBand1.type = "bandpass";
            cafeBand1.frequency.setValueAtTime(300, ctx.currentTime);
            cafeBand1.Q.setValueAtTime(1.5, ctx.currentTime);

            const cafeBand2 = ctx.createBiquadFilter();
            cafeBand2.type = "bandpass";
            cafeBand2.frequency.setValueAtTime(800, ctx.currentTime);
            cafeBand2.Q.setValueAtTime(2.0, ctx.currentTime);

            const cafeBusGain = ctx.createGain();
            cafeBusGain.gain.setValueAtTime(0.8, ctx.currentTime);

            cafeSource.connect(cafeBand1);
            cafeSource.connect(cafeBand2);
            cafeBand1.connect(cafeBusGain);
            cafeBand2.connect(cafeBusGain);

            // Slow LFO (0.2Hz) to emulate subtle dynamic room hum
            const lfo = ctx.createOscillator();
            lfo.type = "sine";
            lfo.frequency.setValueAtTime(0.2, ctx.currentTime);

            const lfoGain = ctx.createGain();
            lfoGain.gain.setValueAtTime(0.15, ctx.currentTime);

            lfo.connect(lfoGain);
            lfoGain.connect(cafeBusGain.gain);
            lfo.start(0);

            const cafeGain = ctx.createGain();
            cafeGain.gain.setValueAtTime(
                audioState.cafeVolume,
                ctx.currentTime,
            );
            cafeBusGain.connect(cafeGain);
            cafeGain.connect(masterGain);
            cafeSource.start(0);

            // --- 3. MECHANICAL KEYS BUS ---
            const keyboardGain = ctx.createGain();
            keyboardGain.gain.setValueAtTime(
                audioState.keyboardVolume,
                ctx.currentTime,
            );
            keyboardGain.connect(masterGain);

            nodesRef.current = {
                ctx,
                masterGain,
                rainGain,
                cafeGain,
                keyboardGain,
                rainSource,
                cafeSource,
                lfo,
            };

            setIsInitialized(true);

            if (ctx.state === "suspended") {
                void ctx.resume();
            }
        } catch (err) {
            console.error("Failed to initialize Web Audio API:", err);
        }
    }, [
        audioState.cafeVolume,
        audioState.keyboardVolume,
        audioState.rainVolume,
        createWhiteNoiseBuffer,
        createBrownianNoiseBuffer,
    ]);

    // Adjust individual track volumes
    useEffect(() => {
        if (!nodesRef.current) return;
        const { ctx, rainGain, cafeGain, keyboardGain } = nodesRef.current;
        const now = ctx.currentTime;

        rainGain.gain.setTargetAtTime(audioState.rainVolume, now, 0.05);
        cafeGain.gain.setTargetAtTime(audioState.cafeVolume, now, 0.05);
        keyboardGain.gain.setTargetAtTime(audioState.keyboardVolume, now, 0.05);
    }, [
        audioState.rainVolume,
        audioState.cafeVolume,
        audioState.keyboardVolume,
    ]);

    // Master Gain and Fade out when timeLeft <= 10
    useEffect(() => {
        if (!nodesRef.current) return;
        const { ctx, masterGain } = nodesRef.current;
        const now = ctx.currentTime;

        const isRunning = timerStatus === "running";
        const isPreviewing = isAudioPreviewing && timerStatus !== "running";
        const isMuted = audioState.isMuted;
        const isChimeOnly = audioState.playbackMode === "chimeOnly";
        const shouldPlay =
            (isRunning || isPreviewing) && !isMuted && !isChimeOnly;

        if (!shouldPlay) {
            masterGain.gain.setTargetAtTime(0, now, 0.05);
            return;
        }

        if (isRunning && timeLeft <= 10 && timeLeft > 0) {
            const fadeFactor = Math.max(0, timeLeft / 10);
            masterGain.gain.setTargetAtTime(fadeFactor, now, 0.1);
        } else if (isRunning && timeLeft <= 0) {
            masterGain.gain.setTargetAtTime(0, now, 0.05);
        } else {
            masterGain.gain.setTargetAtTime(1.0, now, 0.05);
        }
    }, [
        timerStatus,
        audioState.isMuted,
        audioState.playbackMode,
        timeLeft,
        isAudioPreviewing,
    ]);

    // Soft transient mechanical key clicks (bandpass filtered noise bursts: center 2.2kHz, duration 25ms)
    useEffect(() => {
        const isRunning = timerStatus === "running";
        const isPreviewing = isAudioPreviewing && timerStatus !== "running";
        const isChimeOnly = audioState.playbackMode === "chimeOnly";

        const playKeyClick = () => {
            if (
                !nodesRef.current ||
                (!isRunning && !isPreviewing) ||
                isChimeOnly ||
                audioState.isMuted ||
                audioState.keyboardVolume <= 0
            ) {
                return;
            }

            const { ctx, keyboardGain } = nodesRef.current;
            const now = ctx.currentTime;
            const clickDuration = 0.025; // 25ms duration

            // 25ms noise burst buffer
            const clickBuffer = ctx.createBuffer(
                1,
                Math.floor(ctx.sampleRate * clickDuration),
                ctx.sampleRate,
            );
            const clickData = clickBuffer.getChannelData(0);
            for (let i = 0; i < clickData.length; i++) {
                clickData[i] = Math.random() * 2 - 1;
            }

            const burstSource = ctx.createBufferSource();
            burstSource.buffer = clickBuffer;

            // Bandpass filter centered at 2.2kHz
            const clickFilter = ctx.createBiquadFilter();
            clickFilter.type = "bandpass";
            clickFilter.frequency.setValueAtTime(2200, now);
            clickFilter.Q.setValueAtTime(3.5, now);

            // Short exponential decay gain node
            const clickGain = ctx.createGain();
            clickGain.gain.setValueAtTime(0.0001, now);
            clickGain.gain.linearRampToValueAtTime(0.28, now + 0.002);
            clickGain.gain.exponentialRampToValueAtTime(
                0.0001,
                now + clickDuration,
            );

            burstSource.connect(clickFilter);
            clickFilter.connect(clickGain);
            clickGain.connect(keyboardGain);

            burstSource.start(now);
            burstSource.stop(now + clickDuration + 0.005);
        };

        const scheduleNextClick = () => {
            if (
                (!isRunning && !isPreviewing) ||
                isChimeOnly ||
                audioState.isMuted ||
                audioState.keyboardVolume <= 0
            ) {
                return;
            }

            // Random 150ms - 400ms interval
            const delay = Math.floor(Math.random() * (400 - 150 + 1)) + 150;
            clickTimeoutRef.current = setTimeout(() => {
                playKeyClick();
                scheduleNextClick();
            }, delay);
        };

        if (
            (isRunning || isPreviewing) &&
            !isChimeOnly &&
            !audioState.isMuted &&
            audioState.keyboardVolume > 0
        ) {
            scheduleNextClick();
        } else {
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
                clickTimeoutRef.current = null;
            }
        }

        return () => {
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
                clickTimeoutRef.current = null;
            }
        };
    }, [
        timerStatus,
        audioState.isMuted,
        audioState.playbackMode,
        audioState.keyboardVolume,
        isAudioPreviewing,
    ]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
            }
            if (nodesRef.current) {
                try {
                    nodesRef.current.rainSource.stop();
                    nodesRef.current.cafeSource.stop();
                    nodesRef.current.lfo.stop();
                    void nodesRef.current.ctx.close();
                } catch {
                    // Context might already be closed
                }
                nodesRef.current = null;
            }
        };
    }, []);

    return {
        initAudio,
        isInitialized,
        playCompletionChime,
    };
}
