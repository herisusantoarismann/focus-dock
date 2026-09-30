"use client";

import React from "react";
import { TaskLogItem } from "@/types/focus";
import { Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";

export interface WorkLogItemProps {
    item: TaskLogItem;
    onDelete: (id: string) => void;
    className?: string;
}

export function WorkLogItem({ item, onDelete, className }: WorkLogItemProps) {
    const target = item.targetMinutes || item.durationMinutes;
    const isEarly = Boolean(item.isEarlyFinish);

    let formattedTime = "";
    try {
        const d = new Date(item.completedAt);
        if (!isNaN(d.getTime())) {
            formattedTime = d.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        }
    } catch {
        formattedTime = "";
    }

    const durationLabel = isEarly
        ? `⚠️ Early Finish: ${item.durationMinutes}m of ${target}m target`
        : `Full Session: ${item.durationMinutes}m`;

    return (
        <div
            className={clsx(
                "group flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-zinc-900 transition-all",
                className,
            )}
        >
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                    className={clsx(
                        "p-1.5 rounded-lg shrink-0",
                        isEarly
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-emerald-500/10 text-emerald-400",
                    )}
                >
                    {isEarly ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                </div>

                <div className="flex flex-col min-w-0 pr-1">
                    <span
                        className="text-sm font-medium text-slate-100 truncate"
                        title={item.title}
                    >
                        {item.title}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                        <span
                            className={clsx(
                                "font-medium",
                                isEarly
                                    ? "text-amber-400/90"
                                    : "text-emerald-400/90",
                            )}
                        >
                            {durationLabel}
                        </span>
                        {formattedTime ? (
                            <>
                                <span>•</span>
                                <span className="text-slate-500 font-mono">
                                    [{formattedTime}]
                                </span>
                            </>
                        ) : null}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-1.5">
                <span
                    className={clsx(
                        "px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-semibold rounded-md font-mono border whitespace-nowrap",
                        isEarly
                            ? "bg-amber-950/70 text-amber-400 border-amber-500/20"
                            : "bg-emerald-950/80 text-emerald-400 border-emerald-500/20",
                    )}
                >
                    {isEarly
                        ? `⚡ ${item.durationMinutes}m / ${target}m`
                        : `${item.durationMinutes}m`}
                </span>

                <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="p-1 sm:p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-70 group-hover:opacity-100 transition-all focus:outline-none"
                    title="Delete task log"
                    aria-label={`Delete ${item.title}`}
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
