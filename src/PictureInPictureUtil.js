/**
 * Picture In Picture API Support util
 * @author Electroteque Media Daniel Rossi <danielr@electroteque.org>
 * Copyright (c) 2023 Electroteque Media
 */

let _chromeSupport = false,
_webkitSupport = false;

export default class PictureInPictureUtil {

	/**
	 * Call supported to set different api support
	 */
	static get supported() {
		_chromeSupport = 'pictureInPictureEnabled' in document;
		_webkitSupport = 'webkitSupportsPresentationMode' in HTMLVideoElement.prototype;
		return _chromeSupport || _webkitSupport;
	}

	/**
	 * webkit support
	 */
	static get webkitSupport() {
		return _webkitSupport;
	}

	/**
	 * chrome support
	 */
	static get chromeSupport() {
		return _chromeSupport;
	} 
}