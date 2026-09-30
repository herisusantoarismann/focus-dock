"use client";

import React, { useState } from "react";
import { useFocusStore } from "@/stores/useFocusStore";
import { AudioMixerTrack } from "@/components/molecules/AudioMixerTrack";
import {
    CloudRain,
    Coffee,
    Keyboard,
    Volume2,
    VolumeX,
    Sparkles,
    Headphones,
    Square,
    BellRing,
    Radio,
} from "lucide-react";
import { playCompletionChime } from "@/lib/chimeAudio";
import { clsx } from "clsx";

export interface AmbientAudioPanelProps {
    onInteractAudio?: () => void;
    className?: string;
}

export function AmbientAudioPanel({
    onInteractAudio,
    className,
}: AmbientAudioPanelProps) {
    const audio = useFocusStore((state) => state.audio);
    const status = useFocusStore((state) => state.status);
    const isAudioPreviewing = useFocusStore((state) => state.isAudioPreviewing);
    const setAudioVolume = useFocusStore((state) => state.setAudioVolume);
    const setAudioPlaybackMode = useFocusStore(
        (state) => state.setAudioPlaybackMode,
    );
    const toggleMute = useFocusStore((state) => state.toggleMute);
    const toggleAudioPreview = useFocusStore(
        (state) => state.toggleAudioPreview,
    );

    const [isTestingChime, setIsTestingChime] = useState(false);

    const isTimerRunning = status === "running";
    const playbackMode = audio.playbackMode ?? "ambient";
    const isChimeOnly = playbackMode === "chimeOnly";

    const handleSelectMode = (mode: "ambient" | "chimeOnly") => {
        onInteractAudio?.();
        setAudioPlaybackMode(mode);
    };

    const handleTestChime = () => {
        onInteractAudio?.();
        setIsTestingChime(true);
        playCompletionChime();
        setTimeout(() => {
            setIsTestingChime(false);
        }, 2400);
    };

    const handleVolumeChange = (
        key: "rainVolume" | "cafeVolume" | "keyboardVolume",
        val: number,
    ) => {
        onInteractAudio?.();
        setAudioVolume(key, val);
        // Automatically start previewing if user tweaks volume while timer is idle
        if (!isTimerRunning && !isAudioPreviewing && !isChimeOnly) {
            toggleAudioPreview();
        }
    };

    const handleTogglePreview = () => {
        onInteractAudio?.();
        toggleAudioPreview();
    };

    const handleToggleMute = () => {
        onInteractAudio?.();
        toggleMute();
    };

    return (
        <div
            className={clsx(
                "flex flex-col gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-slate-800/80 shadow-md backdrop-blur-sm",
                className,
            )}
        >
            {/* Header with Title & Action Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                        Audio Engine
                    </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {/* In Chime-Only mode: Test Chime Button */}
                    {isChimeOnly ? (
                        <button
                            type="button"
                            onClick={handleTestChime}
                            disabled={isTestingChime}
                            className={clsx(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer",
                                isTestingChime
                                    ? "bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-sm animate-pulse"
                                    : "bg-zinc-800 text-amber-300 border-amber-500/30 hover:bg-zinc-700 hover:text-amber-200",
                            )}
                            title="Test the end-of-session completion chime"
                            aria-label="Test completion chime"
                        >
                            <BellRing
                                className={clsx(
                                    "w-3.5 h-3.5",
                                    isTestingChime && "animate-bounce",
                                )}
                            />
                            <span>
                                {isTestingChime
                                    ? "Ringing Bell..."
                                    : "Test Chime"}
                            </span>
                        </button>
                    ) : /* In Ambient mode: Test Soundboard Preview */
                    !isTimerRunning ? (
                        <button
                            type="button"
                            onClick={handleTogglePreview}
                            className={clsx(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer",
                                isAudioPreviewing
                                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-sm animate-pulse"
                                    : "bg-zinc-800 text-slate-200 border-slate-700 hover:bg-zinc-700 hover:text-white",
                            )}
                            title={
                                isAudioPreviewing
                                    ? "Stop audio preview"
                                    : "Test and preview soundboard before starting timer"
                            }
                            aria-label={
                                isAudioPreviewing
                                    ? "Stop audio preview"
                                    : "Test audio soundboard"
                            }
                        >
                            {isAudioPreviewing ? (
                                <>
                                    <Square className="w-3.5 h-3.5 fill-current text-emerald-400" />
                                    <span>Stop Test</span>
                                </>
                            ) : (
                                <>
                                    <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Test Audio</span>
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>Live</span>
                        </div>
                    )}

                    {/* Master Mute Toggle (Ambient mode only) */}
                    {!isChimeOnly && (
                        <button
                            type="button"
                            onClick={handleToggleMute}
                            className={clsx(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer",
                                audio.isMuted
                                    ? "bg-red-950/60 text-red-300 border-red-500/40 hover:bg-red-900/60"
                                    : "bg-zinc-800 text-slate-200 border-slate-700 hover:bg-zinc-700",
                            )}
                            aria-label={
                                audio.isMuted
                                    ? "Unmute all audio"
                                    : "Mute all audio"
                            }
                        >
                            {audio.isMuted ? (
                                <>
                                    <VolumeX className="w-3.5 h-3.5 text-red-400" />
                                    <span>Muted</span>
                                </>
                            ) : (
                                <>
                                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Master Sound</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Audio Mode Preset Segmented Toggle */}
            <div className="flex p-1 bg-zinc-950/80 border border-slate-800 rounded-xl gap-1 text-xs">
                <button
                    type="button"
                    onClick={() => handleSelectMode("ambient")}
                    title="Ambient Soundscapes (Rain, Cafe, Keyboard)"
                    className={clsx(
                        "flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg transition-all font-medium cursor-pointer",
                        !isChimeOnly
                            ? "bg-zinc-800 text-emerald-400 font-semibold shadow-sm border border-emerald-500/30"
                            : "text-slate-400 hover:text-slate-200 hover:bg-zinc-800/40",
                    )}
                >
                    <Radio className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                        Ambient
                        <span className="hidden sm:inline"> Soundscapes</span>
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => handleSelectMode("chimeOnly")}
                    title="Chime Only / External Music (Mutes ambient, plays bell chime on finish)"
                    className={clsx(
                        "flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg transition-all font-medium cursor-pointer",
                        isChimeOnly
                            ? "bg-zinc-800 text-amber-300 font-semibold shadow-sm border border-amber-500/30"
                            : "text-slate-400 hover:text-slate-200 hover:bg-zinc-800/40",
                    )}
                >
                    <BellRing className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                        Chime Only
                        <span className="hidden sm:inline">
                            {" "}
                            / External Music
                        </span>
                    </span>
                </button>
            </div>

            {/* Active Chime Indicator Pill when Chime Only mode is active */}
            {isChimeOnly && (
                <div
                    title="Chime Alert Active (Plays when timer ends)"
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs min-w-0"
                >
                    <div className="flex items-center gap-2 min-w-0 truncate">
                        <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                        </span>
                        <span className="font-semibold truncate">
                            Chime Alert Active{" "}
                            <span className="hidden sm:inline font-normal text-amber-400/80">
                                (Plays when timer ends)
                            </span>
                        </span>
                    </div>
                </div>
            )}

            {/* 3 Tracks: Rain, Cafe, Keyboard (Smoothly dimmed when in Chime Only mode) */}
            <div
                className={clsx(
                    "flex flex-col gap-3 transition-opacity duration-300",
                    isChimeOnly &&
                        "opacity-35 pointer-events-none select-none filter grayscale-[30%]",
                )}
            >
                <AudioMixerTrack
                    label="Rain Ambience"
                    volume={audio.rainVolume}
                    onVolumeChange={(val) =>
                        handleVolumeChange("rainVolume", val)
                    }
                    icon={<CloudRain className="w-4 h-4 text-blue-400" />}
                    isMasterMuted={audio.isMuted || isChimeOnly}
                />

                <AudioMixerTrack
                    label="Cafe Ambience"
                    volume={audio.cafeVolume}
                    onVolumeChange={(val) =>
                        handleVolumeChange("cafeVolume", val)
                    }
                    icon={<Coffee className="w-4 h-4 text-amber-400" />}
                    isMasterMuted={audio.isMuted || isChimeOnly}
                />

                <AudioMixerTrack
                    label="Mechanical Clicks"
                    volume={audio.keyboardVolume}
                    onVolumeChange={(val) =>
                        handleVolumeChange("keyboardVolume", val)
                    }
                    icon={<Keyboard className="w-4 h-4 text-emerald-400" />}
                    isMasterMuted={audio.isMuted || isChimeOnly}
                />
            </div>

            {/* Subtle Helper Micro-Copy */}
            <div className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-800/40 p-2.5 rounded-lg border border-zinc-700/30 leading-relaxed">
                💡 Prefer your own Spotify, Apple Music, or YouTube podcast?
                Switch to Chime Only. FocusDock will keep quiet and only sound a
                gentle bell when your session finishes.
            </div>

            {/* Footer Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-400 pt-1 gap-1">
                <span>
                    Web Audio API (
                    {isChimeOnly ? "Chime Bell Alert" : "Procedural Synthesis"})
                </span>
                <span
                    className={clsx(
                        "font-medium",
                        isTimerRunning || isAudioPreviewing || isTestingChime
                            ? isChimeOnly
                                ? "text-amber-400 animate-pulse"
                                : "text-emerald-400 animate-pulse"
                            : "text-slate-500",
                    )}
                >
                    {isChimeOnly
                        ? isTestingChime
                            ? "Previewing completion chime..."
                            : "Silent ambient — completion bell will sound"
                        : isTimerRunning
                          ? "Playing in active session"
                          : isAudioPreviewing
                            ? "Testing soundboard (Timer is idle)"
                            : "Plays during session or click Test Audio"}
                </span>
            </div>
        </div>
    );
}
