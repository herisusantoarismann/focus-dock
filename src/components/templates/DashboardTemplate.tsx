"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { TimerWorkspace } from "@/components/organisms/TimerWorkspace";
import { AmbientAudioPanel } from "@/components/organisms/AmbientAudioPanel";
import { WorkLogFeed } from "@/components/organisms/WorkLogFeed";
import { SettingsWebhookModal } from "@/components/organisms/SettingsWebhookModal";
import { FloatingPipView } from "@/components/organisms/FloatingPipView";
import { Button } from "@/components/atoms/Button";
import { Timer, Settings, PictureInPicture2 } from "lucide-react";

export interface DashboardTemplateProps {
    isPipSupported: boolean;
    isPipOpen: boolean;
    pipWindow: Window | null;
    onTogglePip: () => void;
    onInteractAudio?: () => void;
}

export function DashboardTemplate({
    isPipSupported,
    isPipOpen,
    pipWindow,
    onTogglePip,
    onInteractAudio,
}: DashboardTemplateProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <div className="flex flex-col min-h-screen bg-zinc-950 text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
            {/* Top Application Bar */}
            <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-zinc-950/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
                    {/* Logo & Tagline */}
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 font-black shrink-0">
                            <Timer className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-sm sm:text-base font-bold tracking-tight text-white">
                                    FocusDock
                                </h1>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                                    Local-First
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 hidden md:block">
                                Deep Work Workspace with Document PiP &
                                Procedural Audio
                            </p>
                        </div>
                    </div>

                    {/* Header Controls */}
                    <div className="flex items-center gap-2">
                        {isPipSupported ? (
                            <Button
                                variant={isPipOpen ? "emerald" : "outline"}
                                size="sm"
                                onClick={onTogglePip}
                                className="text-xs hidden sm:inline-flex"
                                title="Toggle Picture-in-Picture window (Alt+P)"
                            >
                                <PictureInPicture2 className="w-3.5 h-3.5 mr-1.5" />
                                <span>
                                    {isPipOpen ? "PiP Active" : "Pop-out PiP"}
                                </span>
                            </Button>
                        ) : null}

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsSettingsOpen(true)}
                            aria-label="Open Workspace Settings"
                            title="Workspace Settings"
                        >
                            <Settings className="w-4 h-4 text-slate-300" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Workspace Body: 2-Column Responsive Layout */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* Left Column (Timer + Audio Mixer): 7 cols on desktop */}
                    <section className="lg:col-span-7 flex flex-col gap-6 lg:gap-8">
                        {/* Timer Core */}
                        <div className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-zinc-900/40 border border-slate-800/80 shadow-xl backdrop-blur-sm">
                            <TimerWorkspace
                                onTogglePip={onTogglePip}
                                onInteractAudio={onInteractAudio}
                                isPipOpen={isPipOpen}
                                isPipSupported={isPipSupported}
                            />
                        </div>

                        {/* Procedural Sound Mixer */}
                        <AmbientAudioPanel onInteractAudio={onInteractAudio} />
                    </section>

                    {/* Right Column (Intent & Work Log Feed): 5 cols on desktop */}
                    <section className="lg:col-span-5 flex flex-col gap-6">
                        {/* Work Log Timeline */}
                        <WorkLogFeed
                            onOpenSettings={() => setIsSettingsOpen(true)}
                        />
                    </section>
                </div>
            </main>

            {/* Document Picture-in-Picture Portal */}
            {isPipOpen && pipWindow
                ? createPortal(<FloatingPipView />, pipWindow.document.body)
                : null}

            {/* Workspace Settings Modal */}
            <SettingsWebhookModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </div>
    );
}
