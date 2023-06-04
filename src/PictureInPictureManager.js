/**
 * Picture In Picture API Manager
 * @author Electroteque Media Daniel Rossi <danielr@electroteque.org>
 * Copyright (c) 2023 Electroteque Media
 */

import EventEmitter from 'event-emitter';
import PictureInPictureUtil from './PictureInPictureUtil';

let _pipWindow;

export default class PictureInPictureManager extends EventEmitter {

	constructor() {
		super();
		this.pictureInPictureElement = false;
	}

	/**
	 * Check PIP enable state. Blocked on Android.
	 */
	initVideo() {
		const onPipReady = () => {
			this.emit("disabled", ((this.videoEl.readyState === 0) || this.videoEl.disablePictureInPicture));
		};

		onPipReady();

		this.videoEl.addEventListener('loadedmetadata', onPipReady);
		this.videoEl.addEventListener('emptied', onPipReady);

		
	}


	/**
	 * Set a new video element
	 */
	set video(value) {
		this.videoEl = value;
		this.initVideo();
	}

	/**
	 * init events
	 */
	init(video) {

		this.video = video;

		if (PictureInPictureUtil.webkitSupport) {
			this.initWebkitEvents();
		} else {
			this.initChromeEvents();
		}
	}

	/**
	 * init webkit events
	 */
	initWebkitEvents() {
		document.addEventListener('webkitpresentationmodechanged', (e) => this.onWebkitPresentationChanged(e),true);
	}

	/**
	 * init chrome events
	 */
	initChromeEvents() {
		this.videoEl.addEventListener('enterpictureinpicture', (event) => {
			  _pipWindow = event.pictureInPictureWindow;
			  this.emit("enterpictureinpicture", _pipWindow);
			   this.onPipWindowResizeRef = () => this.onPipWindowResize();
			  _pipWindow.addEventListener('resize', this.onPipWindowResizeRef);
		});

		this.videoEl.addEventListener('leavepictureinpicture', (event) => {
				this.emit("leavepictureinpicture");
				_pipWindow.removeEventListener('resize', this.onPipWindowResizeRef);
		});
	}

	/**
	 * Presentation change for webkit
	 * @param {*} e 
	 */
	onWebkitPresentationChanged(e) {
		const element = e.target;

	    if (element.webkitPresentationMode == "picture-in-picture") {
	      // Keep track of the PiP element.  This element just entered PiP mode.
	      //document.pictureInPictureElement = element;
	      this.emit("enterpictureinpicture", element);
	    } else {
	      if (document.pictureInPictureElement == element) {
	        document.pictureInPictureElement = null;
			this.emit("leavepictureinpicture");
	      }
		}

	}

	/**
	 * Pip window resize
	 * @param {*} e 
	 */
	onPipWindowResize(e) {
		this.emit("resize", e);
	}

	/**
	 * Enter/exit Chrome pip 
	 */
	toggleChromePip() {
		if (!document.pictureInPictureElement) {
	      this.videoEl.requestPictureInPicture()
	      .catch(error => {
	        // Video failed to enter Picture-in-Picture mode.

			this.emit("failed", error);
	      });
	    } else {
	      document.exitPictureInPicture()
	      .catch(error => {
	        // Video failed to leave Picture-in-Picture mode.
			this.emit("failed", error);
	      });
	    }
	}

	/**
	 * Enter/exit Webkit pip
	 */
	toggleWebkitPip() {
	
		if (!document.pictureInPictureElement) {
	      this.videoEl.webkitSetPresentationMode("picture-in-picture");
	    } else {
		  //exit pip for webkit
	      this.videoEl.webkitSetPresentationMode("inline");
	    }		
	}

	/**
	 * Toggle picture in picture for both apis
	 */
	togglePictureInPicture() {
		if (PictureInPictureUtil.webkitSupport) {
    		this.toggleWebkitPip();
	    } else {
	    	this.toggleChromePip();
	    }
	}
}