import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "FocusDock - Local-First Pomodoro & PiP Workspace",
    description:
        "A local-first Pomodoro workspace with native Document Picture-in-Picture, Web Audio API sound synthesis, and automatic work-logging.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
        >
            <body className="min-h-full flex flex-col bg-zinc-950 text-slate-100 font-sans">
                {children}
            </body>
        </html>
    );
}
