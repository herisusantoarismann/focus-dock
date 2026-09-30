"use client";

import {
    useState,
    useCallback,
    useEffect,
    useRef,
    useSyncExternalStore,
} from "react";

interface RequestPipOptions {
    width?: number;
    height?: number;
}

const emptySubscribe = () => () => {};
const checkPiPSupport = () =>
    typeof window !== "undefined" && "documentPictureInPicture" in window;
const getServerSnapshot = () => false;

export function useDocumentPiP() {
    const isSupported = useSyncExternalStore(
        emptySubscribe,
        checkPiPSupport,
        getServerSnapshot,
    );

    const [isPipOpen, setIsPipOpen] = useState(false);
    const [pipWindow, setPipWindow] = useState<Window | null>(null);
    const pipWindowRef = useRef<Window | null>(null);

    const closePipWindow = useCallback(() => {
        if (pipWindowRef.current) {
            pipWindowRef.current.close();
            pipWindowRef.current = null;
            setPipWindow(null);
            setIsPipOpen(false);
        }
    }, []);

    const requestPipWindow = useCallback(
        async (options?: RequestPipOptions): Promise<Window | null> => {
            if (
                typeof window === "undefined" ||
                !("documentPictureInPicture" in window)
            ) {
                return null;
            }

            // Close existing PiP window if already open
            if (pipWindowRef.current) {
                pipWindowRef.current.close();
            }

            try {
                const width = options?.width ?? 340;
                const height = options?.height ?? 180;

                const pipWin =
                    await window.documentPictureInPicture!.requestWindow({
                        width,
                        height,
                    });

                // Clone all stylesheets from main document into the PiP window
                Array.from(document.styleSheets).forEach((styleSheet) => {
                    try {
                        const cssRules = Array.from(styleSheet.cssRules)
                            .map((rule) => rule.cssText)
                            .join("");
                        const style = document.createElement("style");
                        style.textContent = cssRules;
                        pipWin.document.head.appendChild(style);
                    } catch {
                        if (styleSheet.href) {
                            const link = document.createElement("link");
                            link.rel = "stylesheet";
                            link.href = styleSheet.href;
                            pipWin.document.head.appendChild(link);
                        }
                    }
                });

                // Ensure PiP document has dark mode class and appropriate body styling
                pipWin.document.documentElement.classList.add("dark");
                pipWin.document.body.className =
                    "bg-zinc-950 text-slate-100 m-0 p-0 overflow-hidden select-none font-sans";

                // Listen for close/pagehide
                pipWin.addEventListener("pagehide", () => {
                    setIsPipOpen(false);
                    setPipWindow(null);
                    pipWindowRef.current = null;
                });

                pipWindowRef.current = pipWin;
                setPipWindow(pipWin);
                setIsPipOpen(true);

                return pipWin;
            } catch (err) {
                console.error(
                    "Failed to open Document Picture-in-Picture window:",
                    err,
                );
                return null;
            }
        },
        [],
    );

    const togglePip = useCallback(
        async (options?: RequestPipOptions): Promise<void> => {
            if (isPipOpen && pipWindowRef.current) {
                closePipWindow();
            } else {
                await requestPipWindow(options);
            }
        },
        [isPipOpen, closePipWindow, requestPipWindow],
    );

    // Close PiP when main page unloads
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (pipWindowRef.current) {
                pipWindowRef.current.close();
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            if (pipWindowRef.current) {
                pipWindowRef.current.close();
            }
        };
    }, []);

    return {
        isSupported,
        isPipOpen,
        pipWindow,
        requestPipWindow,
        closePipWindow,
        togglePip,
    };
}
