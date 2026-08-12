import { default as EventEmitter } from 'event-emitter';
export default class PictureInPictureManager extends EventEmitter {
    pictureInPictureElement: boolean;
    /**
     * Check PIP enable state. Blocked on Android.
     */
    initVideo(): void;
    /**
     * Set a new video element
     */
    set video(value: any);
    videoEl: any;
    /**
     * init events
     */
    init(video: any): void;
    /**
     * init webkit events
     */
    initWebkitEvents(): void;
    /**
     * init chrome events
     */
    initChromeEvents(): void;
    onPipWindowResizeRef: (() => void) | undefined;
    /**
     * Presentation change for webkit
     * @param {*} e
     */
    onWebkitPresentationChanged(e: any): void;
    /**
     * Pip window resize
     * @param {*} e
     */
    onPipWindowResize(e: any): void;
    /**
     * Enter/exit Chrome pip
     */
    toggleChromePip(): Promise<void>;
    /**
     * Enter/exit Webkit pip
     */
    toggleWebkitPip(): Promise<void>;
    /**
     * Toggle picture in picture for both apis
     */
    togglePictureInPicture(): Promise<void>;
}
