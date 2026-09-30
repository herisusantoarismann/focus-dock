interface DocumentPictureInPictureOptions {
    width?: number;
    height?: number;
    disallowReturnToOpener?: boolean;
}

interface DocumentPictureInPictureEventMap {
    enter: Event;
}

interface DocumentPictureInPicture extends EventTarget {
    requestWindow(options?: DocumentPictureInPictureOptions): Promise<Window>;
    readonly window: Window | null;
    onenter: ((this: DocumentPictureInPicture, ev: Event) => void) | null;
    addEventListener<K extends keyof DocumentPictureInPictureEventMap>(
        type: K,
        listener: (
            this: DocumentPictureInPicture,
            ev: DocumentPictureInPictureEventMap[K],
        ) => void,
        options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ): void;
    removeEventListener<K extends keyof DocumentPictureInPictureEventMap>(
        type: K,
        listener: (
            this: DocumentPictureInPicture,
            ev: DocumentPictureInPictureEventMap[K],
        ) => void,
        options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
    ): void;
}

interface Window {
    readonly documentPictureInPicture?: DocumentPictureInPicture;
}
