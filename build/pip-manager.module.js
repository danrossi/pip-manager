
/**
 * @license
 * pip-manager
 * @author danrossi / https://github.com/danrossi
 * Copyright (c) 2017 Google
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Event Emitter
 * @author Electroteque Media Daniel Rossi <danielr@electroteque.org>
 * Copyright (c) 2016 Electroteque Media
 */
/**
 * Creates a new instance of Emitter.
 * @class
 * @returns {Object} emitter - An instance of Emitter.
 * @example
 * var emitter = new Emitter();
 */

const objectToEvents = new WeakMap();

class EventEmitter {

    constructor() {
        objectToEvents.set(this, {});
    }

    /**
     * Adds a listener to the collection for a specified event.
     * @public
     * @function
     * @name Emitter#on
     * @param {String} event - Event name.
     * @param {Function} listener - Listener function.
     * @returns {Object} emitter
     * @example
     * emitter.on('ready', listener);
     */
    on(type, callback) {

        const events = objectToEvents.get(this);

        if (!events[type]) {
            events[type] = [];
        }
        events[type].push(callback);

        return this;
    }

    /**
     * Adds a one time listener to the collection for a specified event. It will execute only once.
     * @public
     * @function
     * @name Emitter#once
     * @param {String} event - Event name.
     * @param {Function} listener - Listener function.
     * @returns {Object} emitter
     * @example
     * me.once('contentLoad', listener);
     */
    once(type, callback) {

        const fn = (...args) => {
            this.off(type, fn);
            callback(...args);
        };

        this.on(type, fn);

        return this;
    }

    /**
     * Removes a listener from the collection for a specified event.
     * @public
     * @function
     * @name Emitter#off
     * @param {String} event - Event name.
     * @param {Function} listener -  Listener function.
     * @returns {Object} emitter
     * @example
     * me.off('ready', listener);
     */
    off(type, callback) {

        const events = objectToEvents.get(this)[type];

        if (events) {
            if (callback === null) {
                events.length = 0;
            } else {
                events.splice(events.indexOf(callback), 1);
            }
        }


        /*let index = 0;

        function isFunction(obj) {
            return typeof obj === 'function' || false;
        }

        if (listeners && listeners.length) {

            index = listeners.reduce((lastIndex, listener, currentIndex) => {
                return isFunction(listener) && listener === callback ? lastIndex = currentIndex : lastIndex;
            }, -1);


            if (index > -1) {
                listeners.splice(index, 1);
                this.listeners.set(event, listeners);
            }
        }*/
        return this;
    }

    /**
     * Returns all listeners from the collection for a specified event.
     * @public
     * @function
     * @name Emitter#listeners
     * @param {String} event - Event name.
     * @returns {Array}
     * @example
     * me.listeners('ready');
     */
    listeners(type) {
        try {
            return objectToEvents.get(this)[type];
        } catch (error) {
            return null;
        }
    }

    /**
     * Execute each item in the listener collection in order with the specified data.
     * @name Emitter#emit
     * @public
     * @function
     * @param {String} event - The name of the event you want to emit.
     * @param {...args} [args] - Data to pass to the listeners.
     * @example
     * me.emit('ready', 'param1', {..}, [...]);
     */
    emit(type, ...args) {

        //const event, events;

        //events = (objectToEvents.get(this)[type] || []).slice();

        const events = objectToEvents.get(this)[type];

        if (events && events.length) {
            events.forEach((listener) => {
                listener({ type: type, target: this}, ...args);
            });
            return true;
        }

        return this;
    }

    emitAsync(type, ...args) {
        //const listeners = this.listeners.get(event),
        const events = objectToEvents.get(this)[type],
            promises = [];


        if (events && events.length) {
            events.forEach((listener) => {
                promises.push(listener({ type: type, target: this}, ...args));
            });
        }

        return Promise.all(promises);
    }

}

/**
 * Picture In Picture API Support util
 * @author Electroteque Media Daniel Rossi <danielr@electroteque.org>
 * Copyright (c) 2023 Electroteque Media
 */

let _chromeSupport = false,
_webkitSupport = false;

class PictureInPictureUtil {

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

/**
 * Picture In Picture API Manager
 * @author Electroteque Media Daniel Rossi <danielr@electroteque.org>
 * Copyright (c) 2023 Electroteque Media
 */

let _pipWindow;

class PictureInPictureManager extends EventEmitter {

	constructor(video) {
		super();
		this.pictureInPictureElement = false;
		this.video = video;
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
	init() {

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
	      document.pictureInPictureElement = element;
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

export { PictureInPictureManager, PictureInPictureUtil };
