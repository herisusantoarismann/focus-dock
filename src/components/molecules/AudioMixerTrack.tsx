"use client";

import React, { useRef } from "react";
import { Slider } from "@/components/atoms/Slider";
import { Volume2, VolumeX } from "lucide-react";
import { clsx } from "clsx";

export interface AudioMixerTrackProps {
    label: string;
    volume: number; // 0 to 1
    onVolumeChange: (volume: number) => void;
    icon: React.ReactNode;
    isMasterMuted?: boolean;
}

export function AudioMixerTrack({
    label,
    volume,
    onVolumeChange,
    icon,
    isMasterMuted = false,
}: AudioMixerTrackProps) {
    const previousVolumeRef = useRef(volume > 0 ? volume : 0.5);

    const isTrackMuted = volume === 0 || isMasterMuted;

    const toggleTrackMute = () => {
        if (isMasterMuted) return;
        if (volume > 0) {
            previousVolumeRef.current = volume;
            onVolumeChange(0);
        } else {
            onVolumeChange(previousVolumeRef.current || 0.5);
        }
    };

    const percentage = Math.round(volume * 100);

    return (
        <div
            className={clsx(
                "flex flex-col gap-2 p-3 rounded-xl bg-zinc-900/50 border border-slate-800/80 transition-all",
                isTrackMuted && "opacity-60",
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="p-1.5 rounded-lg bg-zinc-800 text-slate-300 shrink-0">
                        {icon}
                    </span>
                    <span className="text-xs font-semibold text-slate-200 truncate">
                        {label}
                    </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400 min-w-[36px] text-right">
                        {isMasterMuted ? "Muted" : `${percentage}%`}
                    </span>
                    <button
                        type="button"
                        onClick={toggleTrackMute}
                        disabled={isMasterMuted}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label={`Toggle mute for ${label}`}
                    >
                        {isTrackMuted ? (
                            <VolumeX className="w-3.5 h-3.5 text-red-400" />
                        ) : (
                            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                    </button>
                </div>
            </div>

            <Slider
                value={volume}
                onChange={onVolumeChange}
                disabled={isMasterMuted}
                ariaLabel={`${label} volume`}
            />
        </div>
    );
}
