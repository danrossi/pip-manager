import EventEmitter from "event-emitter";
//#region src/PictureInPictureUtil.js
var _chromeSupport = false;
var _webkitSupport = false;
var PictureInPictureUtil = class {
	static get supported() {
		_chromeSupport = "pictureInPictureEnabled" in document;
		_webkitSupport = "webkitSupportsPresentationMode" in HTMLVideoElement.prototype;
		return _chromeSupport || _webkitSupport;
	}
	static get webkitSupport() {
		return _webkitSupport;
	}
	static get chromeSupport() {
		return _chromeSupport;
	}
};
//#endregion
//#region src/PictureInPictureManager.js
var _pipWindow;
var PictureInPictureManager = class extends EventEmitter {
	constructor() {
		super();
		this.pictureInPictureElement = false;
	}
	initVideo() {
		const onPipReady = () => {
			this.emit("disabled", this.videoEl.readyState === 0 || this.videoEl.disablePictureInPicture);
		};
		onPipReady();
		this.videoEl.addEventListener("loadedmetadata", onPipReady);
		this.videoEl.addEventListener("emptied", onPipReady);
	}
	set video(value) {
		this.videoEl = value;
		this.initVideo();
	}
	init(video) {
		this.video = video;
		if (PictureInPictureUtil.webkitSupport) this.initWebkitEvents();
		else this.initChromeEvents();
	}
	initWebkitEvents() {
		document.addEventListener("webkitpresentationmodechanged", (e) => this.onWebkitPresentationChanged(e), true);
	}
	initChromeEvents() {
		this.videoEl.addEventListener("enterpictureinpicture", (event) => {
			_pipWindow = event.pictureInPictureWindow;
			this.emit("enterpictureinpicture", _pipWindow);
			this.onPipWindowResizeRef = () => this.onPipWindowResize();
			_pipWindow.addEventListener("resize", this.onPipWindowResizeRef);
		});
		this.videoEl.addEventListener("leavepictureinpicture", (event) => {
			this.emit("leavepictureinpicture");
			_pipWindow.removeEventListener("resize", this.onPipWindowResizeRef);
		});
	}
	onWebkitPresentationChanged(e) {
		const element = e.target;
		if (element.webkitPresentationMode == "picture-in-picture") this.emit("enterpictureinpicture", element);
		else if (document.pictureInPictureElement == element) this.emit("leavepictureinpicture");
	}
	onPipWindowResize(e) {
		this.emit("resize", e);
	}
	async toggleChromePip() {
		if (!document.pictureInPictureElement) await this.videoEl.requestPictureInPicture().catch((error) => {
			this.emit("failed", error);
		});
		else await document.exitPictureInPicture().catch((error) => {
			this.emit("failed", error);
		});
	}
	async toggleWebkitPip() {
		if (!document.pictureInPictureElement && this.videoEl.webkitSupportsPresentationMode("picture-in-picture")) await this.videoEl.webkitSetPresentationMode("picture-in-picture");
		else await this.videoEl.webkitSetPresentationMode("inline");
	}
	async togglePictureInPicture() {
		if (PictureInPictureUtil.webkitSupport) await this.toggleWebkitPip();
		else await this.toggleChromePip();
	}
};
//#endregion
export { PictureInPictureManager, PictureInPictureUtil };
