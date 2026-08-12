export default class PictureInPictureUtil {
    /**
     * Call supported to set different api support
     */
    static get supported(): boolean;
    /**
     * webkit support
     */
    static get webkitSupport(): boolean;
    /**
     * chrome support
     */
    static get chromeSupport(): boolean;
}
