(function () {
	'use strict';
	if (typeof require !== 'undefined') {
		this.$ = require('./jquery-1.11.3.min.js');
		this.pdfjsLib = require('./pdf.js');
		var PdfjsWorker = require('./pdf.worker.js');
		this.pdfjsLib.GlobalWorkerOptions.workerPort = new PdfjsWorker();
	}
	var pdfjsLib = this.pdfjsLib,$ = this.$;
	var definePinchZoom = function ($) {
		var PinchZoom = function (el, options, viewerContainer) {
			this.el = $(el);
			this.viewerContainer = viewerContainer;
			this.zoomFactor = 1;
			this.lastScale = 1;
			this.offset = {
				x: 0,
				y: 0
			};
			this.options = $.extend({}, this.defaults, options);
			this.setupMarkup();
			this.bindEvents();
			this.update();
			// default enable.
			this.enable();
			this.height = 0;
			this.load = false;
			this.direction = null;
			this.clientY = null;
			this.lastclientY = null;
		},
			sum = function (a, b) {
				return a + b;
			},
			isCloseTo = function (value, expected) {
				return value > expected - 0.01 && value < expected + 0.01;
			};

		PinchZoom.prototype = {

			defaults: {
				tapZoomFactor: 2,
				zoomOutFactor: 1.2,
				animationDuration: 300,
				maxZoom: 4,
				minZoom: 0.8,
				lockDragAxis: false,
				use2d: true,
				zoomStartEventName: 'pz_zoomstart',
				zoomEndEventName: 'pz_zoomend',
				dragStartEventName: 'pz_dragstart',
				dragEndEventName: 'pz_dragend',
				doubleTapEventName: 'pz_doubletap'
			},

			/**
			 * Event handler for 'dragstart'
			 * @param event
			 */
			handleDragStart: function (event) {
				this.el.trigger(this.options.dragStartEventName);
				this.stopAnimation();
				this.lastDragPosition = false;
				this.hasInteraction = true;
				this.handleDrag(event);
			},

			/**
			 * Event handler for 'drag'
			 * @param event
			 */
			handleDrag: function (event) {

				if (this.zoomFactor > 1.0) {
					var touch = this.getTouches(event)[0];
					this.drag(touch, this.lastDragPosition, event);
					this.offset = this.sanitizeOffset(this.offset);
					this.lastDragPosition = touch;
				}
			},

			handleDragEnd: function () {
				this.el.trigger(this.options.dragEndEventName);
				this.end();
			},

			/**
			 * Event handler for 'zoomstart'
			 * @param event
			 */
			handleZoomStart: function (event) {
				this.el.trigger(this.options.zoomStartEventName);
				this.stopAnimation();
				this.lastScale = 1;
				this.nthZoom = 0;
				this.lastZoomCenter = false;
				this.hasInteraction = true;
			},

			/**
			 * Event handler for 'zoom'
			 * @param event
			 */
			handleZoom: function (event, newScale) {

				// a relative scale factor is used
				var touchCenter = this.getTouchCenter(this.getTouches(event)),
					scale = newScale / this.lastScale;
				this.lastScale = newScale;

				// the first touch events are thrown away since they are not precise
				this.nthZoom += 1;
				if (this.nthZoom > 3) {

					this.scale(scale, touchCenter);
					this.drag(touchCenter, this.lastZoomCenter);
				}
				this.lastZoomCenter = touchCenter;
			},

			handleZoomEnd: function () {
				this.el.trigger(this.options.zoomEndEventName);
				this.end();
			},

			/**
			 * Event handler for 'doubletap'
			 * @param event
			 */
			handleDoubleTap: function (event) {
				var center = this.getTouches(event)[0],
					zoomFactor = this.zoomFactor > 1 ? 1 : this.options.tapZoomFactor,
					startZoomFactor = this.zoomFactor,
					updateProgress = (function (progress) {
						this.scaleTo(startZoomFactor + progress * (zoomFactor - startZoomFactor), center);
					}).bind(this);

				if (this.hasInteraction) {
					return;
				}
				if (startZoomFactor > zoomFactor) {
					center = this.getCurrentZoomCenter();
				}

				this.animate(this.options.animationDuration, updateProgress, this.swing);
				this.el.trigger(this.options.doubleTapEventName);
			},

			/**
			 * Max / min values for the offset
			 * @param offset
			 * @return {Object} the sanitized offset
			 */
			sanitizeOffset: function (offset) {
				var maxX = (this.zoomFactor - 1) * this.getContainerX(),
					maxY = (this.zoomFactor - 1) * this.getContainerY(),
					maxOffsetX = Math.max(maxX, 0),
					maxOffsetY = Math.max(maxY, 0),
					minOffsetX = Math.min(maxX, 0),
					minOffsetY = Math.min(maxY, 0);

				var x = Math.min(Math.max(offset.x, minOffsetX), maxOffsetX),
					y = Math.min(Math.max(offset.y, minOffsetY), maxOffsetY);


				return {
					x: x,
					y: y
				};
			},

			/**
			 * Scale to a specific zoom factor (not relative)
			 * @param zoomFactor
			 * @param center
			 */
			scaleTo: function (zoomFactor, center) {
				this.scale(zoomFactor / this.zoomFactor, center);
			},

			/**
			 * Scales the element from specified center
			 * @param scale
			 * @param center
			 */
			scale: function (scale, center) {
				scale = this.scaleZoomFactor(scale);
				this.addOffset({
					x: (scale - 1) * (center.x + this.offset.x),
					y: (scale - 1) * (center.y + this.offset.y)
				});
			},

			/**
			 * Scales the zoom factor relative to current state
			 * @param scale
			 * @return the actual scale (can differ because of max min zoom factor)
			 */
			scaleZoomFactor: function (scale) {
				var originalZoomFactor = this.zoomFactor;
				this.zoomFactor *= scale;
				this.zoomFactor = Math.min(this.options.maxZoom, Math.max(this.zoomFactor, this.options.minZoom));
				return this.zoomFactor / originalZoomFactor;
			},

			/**
			 * Drags the element
			 * @param center
			 * @param lastCenter
			 */
			drag: function (center, lastCenter, event) {
				if (lastCenter) {
					if (this.options.lockDragAxis) {
						// lock scroll to position that was changed the most
						if (Math.abs(center.x - lastCenter.x) > Math.abs(center.y - lastCenter.y)) {
							this.addOffset({
								x: -(center.x - lastCenter.x),
								y: 0
							});
						} else {
							this.addOffset({
								y: -(center.y - lastCenter.y),
								x: 0
							});
						}
					} else {
						if (center.y - lastCenter.y < 0) {
							this.direction = "down";
						} else if (center.y - lastCenter.y > 10) {
							this.direction = "up";
						}
						this.addOffset({
							y: -(center.y - lastCenter.y),
							x: -(center.x - lastCenter.x)
						});
					}
				}
			},

			/**
			 * Calculates the touch center of multiple touches
			 * @param touches
			 * @return {Object}
			 */
			getTouchCenter: function (touches) {
				return this.getVectorAvg(touches);
			},

			/**
			 * Calculates the average of multiple vectors (x, y values)
			 */
			getVectorAvg: function (vectors) {
				return {
					x: vectors.map(function (v) {
						return v.x;
					}).reduce(sum) / vectors.length,
					y: vectors.map(function (v) {
						return v.y;
					}).reduce(sum) / vectors.length
				};
			},

			/**
			 * Adds an offset
			 * @param offset the offset to add
			 * @return return true when the offset change was accepted
			 */
			addOffset: function (offset) {
				this.offset = {
					x: this.offset.x + offset.x,
					y: this.offset.y + offset.y
				};
			},

			sanitize: function () {
				if (this.zoomFactor < this.options.zoomOutFactor) {
					this.zoomOutAnimation();
				} else if (this.isInsaneOffset(this.offset)) {
					this.sanitizeOffsetAnimation();
				}
			},

			/**
			 * Checks if the offset is ok with the current zoom factor
			 * @param offset
			 * @return {Boolean}
			 */
			isInsaneOffset: function (offset) {
				var sanitizedOffset = this.sanitizeOffset(offset);
				return sanitizedOffset.x !== offset.x ||
					sanitizedOffset.y !== offset.y;
			},

			/**
			 * Creates an animation moving to a sane offset
			 */
			sanitizeOffsetAnimation: function () {
				var targetOffset = this.sanitizeOffset(this.offset),
					startOffset = {
						x: this.offset.x,
						y: this.offset.y
					},
					updateProgress = (function (progress) {
						this.offset.x = startOffset.x + progress * (targetOffset.x - startOffset.x);
						this.offset.y = startOffset.y + progress * (targetOffset.y - startOffset.y);
						this.update();
					}).bind(this);

				this.animate(
					this.options.animationDuration,
					updateProgress,
					this.swing
				);
			},

			/**
			 * Zooms back to the original position,
			 * (no offset and zoom factor 1)
			 */
			zoomOutAnimation: function () {
				var startZoomFactor = this.zoomFactor,
					zoomFactor = 1,
					center = this.getCurrentZoomCenter(),
					updateProgress = (function (progress) {
						this.scaleTo(startZoomFactor + progress * (zoomFactor - startZoomFactor), center);
					}).bind(this);

				this.animate(
					this.options.animationDuration,
					updateProgress,
					this.swing
				);
			},

			/**
			 * Updates the aspect ratio
			 */
			updateAspectRatio: function () {
				this.setContainerY(this.getContainerX() / this.getAspectRatio());
			},

			/**
			 * Calculates the initial zoom factor (for the element to fit into the container)
			 * @return the initial zoom factor
			 */
			getInitialZoomFactor: function () {
				// use .offsetWidth instead of width()
				// because jQuery-width() return the original width but Zepto-width() will calculate width with transform.
				// the same as .height()
				if (this.container[0] && this.el[0]) {
					return this.container[0].offsetWidth / this.el[0].offsetWidth;
				} else {
					return 0
				}
			},

			/**
			 * Calculates the aspect ratio of the element
			 * @return the aspect ratio
			 */
			getAspectRatio: function () {
				if (this.el[0]) {
					var offsetHeight = this.el[0].offsetHeight;
					return this.container[0].offsetWidth / offsetHeight;
				} else {
					return 0
				}

			},

			/**
			 * Calculates the virtual zoom center for the current offset and zoom factor
			 * (used for reverse zoom)
			 * @return {Object} the current zoom center
			 */
			getCurrentZoomCenter: function () {

				// uses following formula to calculate the zoom center x value
				// offset_left / offset_right = zoomcenter_x / (container_x - zoomcenter_x)
				var length = this.container[0].offsetWidth * this.zoomFactor,
					offsetLeft = this.offset.x,
					offsetRight = length - offsetLeft - this.container[0].offsetWidth,
					widthOffsetRatio = offsetLeft / offsetRight,
					centerX = widthOffsetRatio * this.container[0].offsetWidth / (widthOffsetRatio + 1),

					// the same for the zoomcenter y
					height = this.container[0].offsetHeight * this.zoomFactor,
					offsetTop = this.offset.y,
					offsetBottom = height - offsetTop - this.container[0].offsetHeight,
					heightOffsetRatio = offsetTop / offsetBottom,
					centerY = heightOffsetRatio * this.container[0].offsetHeight / (heightOffsetRatio + 1);

				// prevents division by zero
				if (offsetRight === 0) {
					centerX = this.container[0].offsetWidth;
				}
				if (offsetBottom === 0) {
					centerY = this.container[0].offsetHeight;
				}

				return {
					x: centerX,
					y: centerY
				};
			},

			canDrag: function () {
				return !isCloseTo(this.zoomFactor, 1);
			},

			/**
			 * Returns the touches of an event relative to the container offset
			 * @param event
			 * @return array touches
			 */
			getTouches: function (event) {
				var position = this.container.offset();
				return Array.prototype.slice.call(event.touches).map(function (touch) {
					return {
						x: touch.pageX - position.left,
						y: touch.pageY - position.top
					};
				});
			},

			/**
			 * Animation loop
			 * does not support simultaneous animations
			 * @param duration
			 * @param framefn
			 * @param timefn
			 * @param callback
			 */
			animate: function (duration, framefn, timefn, callback) {
				var startTime = new Date().getTime(),
					renderFrame = (function () {
						if (!this.inAnimation) {
							return;
						}
						var frameTime = new Date().getTime() - startTime,
							progress = frameTime / duration;
						if (frameTime >= duration) {
							framefn(1);
							if (callback) {
								callback();
							}
							this.update();
							this.stopAnimation();
							this.update();
						} else {
							if (timefn) {
								progress = timefn(progress);
							}
							framefn(progress);
							this.update();
							requestAnimationFrame(renderFrame);
						}
					}).bind(this);
				this.inAnimation = true;
				requestAnimationFrame(renderFrame);
			},

			/**
			 * Stops the animation
			 */
			stopAnimation: function () {
				this.inAnimation = false;

			},

			/**
			 * Swing timing function for animations
			 * @param p
			 * @return {Number}
			 */
			swing: function (p) {
				return -Math.cos(p * Math.PI) / 2 + 0.5;
			},

			getContainerX: function () {
				if (this.el[0]) {
					return this.el[0].offsetWidth;
				} else {
					return 0;
				}
			},

			getContainerY: function () {
				return this.el[0].offsetHeight;
			},
			setContainerY: function (y) {
				y = y.toFixed(2);
				return this.container.height(y);
			},

			/**
			 * Creates the expected html structure
			 */
			setupMarkup: function () {
				this.container = $('<div class="pinch-zoom-container"></div>');
				this.el.before(this.container);
				this.container.append(this.el);

				this.container.css({
					'position': 'relative',
					//                  'width':'auto',
					//                  'height':'auto'
				});

				// Zepto doesn't recognize `webkitTransform..` style
				this.el.css({
					'-webkit-transform-origin': '0% 0%',
					'-moz-transform-origin': '0% 0%',
					'-ms-transform-origin': '0% 0%',
					'-o-transform-origin': '0% 0%',
					'transform-origin': '0% 0%',
					'position': 'relative'
				});

			},

			end: function () {
				this.hasInteraction = false;
				this.sanitize();
				this.update();

			},

			/**
			 * Binds all required event listeners
			 */
			bindEvents: function () {
				detectGestures(this.container.eq(0), this, this.viewerContainer);
				// Zepto and jQuery both know about `on`
				$(window).on('resize', this.update.bind(this));
				$(this.el).find('img').on('load', this.update.bind(this));

			},

			/**
			 * Updates the css values according to the current zoom factor and offset
			 */
			update: function () {

				if (this.updatePlaned) {
					return;
				}
				this.updatePlaned = true;
				setTimeout((function () {
					this.updatePlaned = false;
					this.updateAspectRatio();
					var zoomFactor = this.getInitialZoomFactor() * this.zoomFactor,
						offsetX = (-this.offset.x / zoomFactor).toFixed(3),
						offsetY = (-this.offset.y / zoomFactor).toFixed(3);
					this.lastclientY = offsetY;

					var transform3d = 'scale3d(' + zoomFactor + ', ' + zoomFactor + ',1) ' +
						'translate3d(' + offsetX + 'px,' + offsetY + 'px,0px)',
						transform2d = 'scale(' + zoomFactor + ', ' + zoomFactor + ') ' +
							'translate(' + offsetX + 'px,' + offsetY + 'px)',
						removeClone = (function () {
							if (this.clone) {
								this.clone.remove();
								delete this.clone;
							}
						}).bind(this);
					// Scale 3d and translate3d are faster (at least on ios)
					// but they also reduce the quality.
					// PinchZoom uses the 3d transformations during interactions
					// after interactions it falls back to 2d transformations
					if (!this.options.use2d || this.hasInteraction || this.inAnimation) {
						this.is3d = true;
						//                      removeClone();
						this.el.css({
							'-webkit-transform': transform3d,
							'-o-transform': transform2d,
							'-ms-transform': transform2d,
							'-moz-transform': transform2d,
							'transform': transform3d
						});
					} else {

						// When changing from 3d to 2d transform webkit has some glitches.
						// To avoid this, a copy of the 3d transformed element is displayed in the
						// foreground while the element is converted from 3d to 2d transform
						if (this.is3d) {
							//                          this.clone = this.el.clone();
							//                          this.clone.css('pointer-events', 'none');
							//                          this.clone.appendTo(this.container);
							//                          setTimeout(removeClone, 200);
						}
						this.el.css({
							'-webkit-transform': transform2d,
							'-o-transform': transform2d,
							'-ms-transform': transform2d,
							'-moz-transform': transform2d,
							'transform': transform2d
						});
						this.is3d = false;
					}
					this.done && this.done.call(this, zoomFactor)
				}).bind(this), 0);
			},

			/**
			 * Enables event handling for gestures
			 */
			enable: function () {
				this.enabled = true;
			},
			/**
			 * Disables event handling for gestures
			 */
			disable: function () {
				this.enabled = false;
			},
			//销毁还原
			destroy: function () {
				var dom = this.el.clone();
				var p = this.container.parent();
				this.container.remove();
				dom.removeAttr('style');
				p.append(dom);
			}
		};

		var detectGestures = function (el, target, viewerContainer) {
			var interaction = null,
				fingers = 0,
				lastTouchStart = null,
				startTouches = null,
				lastTouchY = null,
				clientY = null,
				lastclientY = 0,
				lastTop = 0,
				setInteraction = function (newInteraction, event) {
					if (interaction !== newInteraction) {

						if (interaction && !newInteraction) {
							switch (interaction) {
								case "zoom":
									target.handleZoomEnd(event);
									break;
								case 'drag':
									target.handleDragEnd(event);
									break;
							}
						}

						switch (newInteraction) {
							case 'zoom':
								target.handleZoomStart(event);
								break;
							case 'drag':
								target.handleDragStart(event);
								break;
						}
					}
					interaction = newInteraction;
				},

				updateInteraction = function (event) {
					if (fingers === 2) {
						setInteraction('zoom');
					} else if (fingers === 1 && target.canDrag()) {
						setInteraction('drag', event);
					} else {
						setInteraction(null, event);
					}
				},

				targetTouches = function (touches) {
					return Array.prototype.slice.call(touches).map(function (touch) {
						return {
							x: touch.pageX,
							y: touch.pageY
						};
					});
				},

				getDistance = function (a, b) {
					var x, y;
					x = a.x - b.x;
					y = a.y - b.y;
					return Math.sqrt(x * x + y * y);
				},

				calculateScale = function (startTouches, endTouches) {
					var startDistance = getDistance(startTouches[0], startTouches[1]),
						endDistance = getDistance(endTouches[0], endTouches[1]);
					return endDistance / startDistance;
				},

				cancelEvent = function (event) {
					event.stopPropagation();
					event.preventDefault();
				},

				detectDoubleTap = function (event) {
					var time = (new Date()).getTime();
					var pageY = event.changedTouches[0].pageY;
					var top = parentNode.scrollTop || 0;
					if (fingers > 1) {
						lastTouchStart = null;
						lastTouchY = null;
						cancelEvent(event);
					}

					if (time - lastTouchStart < 300 && Math.abs(pageY - lastTouchY) < 10 && Math.abs(lastTop - top) < 10) {
						cancelEvent(event);
						target.handleDoubleTap(event);
						switch (interaction) {
							case "zoom":
								target.handleZoomEnd(event);
								break;
							case 'drag':
								target.handleDragEnd(event);
								break;
						}
					}

					if (fingers === 1) {
						lastTouchStart = time;
						lastTouchY = pageY;
						lastTop = top;
					}
				},
				firstMove = true;
			if (viewerContainer) {
				var parentNode = viewerContainer[0];
			}
			if (parentNode) {
				parentNode.addEventListener('touchstart', function (event) {
					if (target.enabled) {
						firstMove = true;
						fingers = event.touches.length;
						detectDoubleTap(event);
						clientY = event.changedTouches[0].clientY;
						if (fingers > 1) {
							cancelEvent(event);
						}
					}
				});

				parentNode.addEventListener('touchmove', function (event) {
					if (target.enabled) {
						lastclientY = event.changedTouches[0].clientY;
						if (firstMove) {
							updateInteraction(event);
							if (interaction) {
								//                          cancelEvent(event);
							}
							startTouches = targetTouches(event.touches);
						} else {
							switch (interaction) {
								case 'zoom':
									target.handleZoom(event, calculateScale(startTouches, targetTouches(event.touches)));
									break;
								case 'drag':
									target.handleDrag(event);
									break;
							}
							if (interaction) {
								//                          cancelEvent(event);
								target.update(lastclientY);
							}
						}
						if (fingers > 1) {
							cancelEvent(event);
						}
						firstMove = false;
					}
				});

				parentNode.addEventListener('touchend', function (event) {
					if (target.enabled) {
						fingers = event.touches.length;
						if (fingers > 1) {
							cancelEvent(event);
						}
						updateInteraction(event);
					}
				});
			}

		};

		return PinchZoom;
	};
	var PinchZoom = definePinchZoom($);
	var Pdfh5 = function (dom, options) {
		this.container = $(dom);
		this.thePDF = null;
		this.totalNum = null;
		this.pages = null;
		this.initTime = 0;
		this.scale = 1.3;
		this.currentNum = 1;
		this.endTime = 0;
		this.pinchZoom = null;
		this.timer = null;
		this.docWidth = document.documentElement.clientWidth;
		this.eventType = {};
		this.cache = {};
		this.init(options);
	};
	Pdfh5.prototype = {
		init: function (options) {
			this.container.addClass("pdfjs")
			var self = this;
			pdfjsLib.cMapUrl = './cmaps/';
			pdfjsLib.cMapPacked = true;
			this.initTime = new Date().getTime();
			setTimeout(function () {
				var arr1 = self.eventType["scroll"];
				if (arr1 && arr1 instanceof Array) {
					for (var i = 0; i < arr1.length; i++) {
						arr1[i] && arr1[i].call(self,self.initTime)
					}
				}
			}, 0)
			options = options ? options : {};
			options.pdfurl = options.pdfurl ? options.pdfurl : null;
			options.data = options.data ? options.data : null;
			options.scale = options.scale ? options.scale : self.scale;
			options.zoomEnable = options.zoomEnable === false ? false : true;
			options.scrollEnable = options.scrollEnable === false ? false : true;
			options.loadingBar = options.loadingBar === false ? false : true;
			options.pageNum = options.pageNum === false ? false : true;
			options.backTop = options.backTop === false ? false : true;
			options.URIenable = options.URIenable === false ? false : true;
			options.fullscreen = options.fullscreen === false ? false : true;
			options.lazy = options.lazy === true ? true : false;
			var html = '<div class="loadingBar">' +
				'<div class="progress">' +
				' <div class="glimmer">' +
				'</div>' +
				' </div>' +
				'</div>' +
				'<div class="pageNum">' +
				'<div class="pageNum-bg"></div>' +
				' <div class="pageNum-num">' +
				' <span class="pageNow">1</span>/' +
				'<span class="pageTotal">1</span>' +
				'</div>' +
				' </div>' +
				'<div class="backTop">' +
				'</div>' ;
			if (!this.container.find('.pageNum')[0]) {
				this.container.append(html);
			}
			var viewer = document.createElement("div");
			viewer.className = 'pdfViewer';
			var viewerContainer = document.createElement("div");
			viewerContainer.className = 'viewerContainer';
			viewerContainer.appendChild(viewer);
			this.container.append(viewerContainer);
			this.viewer = $(viewer);
			this.viewerContainer = $(viewerContainer);
			this.pageNum = this.container.find('.pageNum');
			this.pageNow = this.pageNum.find('.pageNow');
			this.pageTotal = this.pageNum.find('.pageTotal');
			this.loadingBar = this.container.find('.loadingBar');
			this.progress = this.loadingBar.find('.progress');
			this.backTop = this.container.find('.backTop');
			if (!options.loadingBar) {
				this.loadingBar.hide()
			}
			var height = document.documentElement.clientHeight * (1 / 3);
			if (!options.scrollEnable) {
				this.viewerContainer.css({
					"overflow": "hidden"
				})
			} else {
				this.viewerContainer.css({
					"overflow": "auto"
				})
			}
			viewerContainer.addEventListener('scroll', function () {
				var scrollTop = viewerContainer.scrollTop;
				if (scrollTop >= 150) {
					if (options.backTop) {
						self.backTop.show();
					}
				} else {
					if (options.backTop) {
						self.backTop.fadeOut(200);
					}
				}
				if (self.viewerContainer) {
					self.pages = self.viewerContainer.find('.pageContainer');
				}
				clearTimeout(self.timer);
				if (options.pageNum) {
					self.pageNum.show();
				}
				if (self.pages) {
					self.pages.each(function (index, obj) {
						var top = obj.getBoundingClientRect().top;
						var bottom = obj.getBoundingClientRect().bottom;
						if (top <= height && bottom > height) {
							if (options.pageNum) {
								self.pageNow.text(index + 1)
							}
							self.currentNum = index + 1
						}
					})
				}
				self.timer = setTimeout(function () {
					if (options.pageNum) {
						self.pageNum.fadeOut(200);
					}
				}, 1500)
				if(options.lazy){
					if(!self.cache[self.currentNum+""].loaded){
						var num = Math.floor(100 / self.totalNum).toFixed(2);
						var page = self.cache[self.currentNum+""].page;
						var container = self.cache[self.currentNum+""].container;
						var pageNum = self.currentNum;
						var scaledViewport = self.cache[pageNum+""].scaledViewport;
						self.cache[pageNum+""].loaded = true;
						self.renderSvg(page,scaledViewport,pageNum,num,container,options)
					}
					if(self.cache[(self.totalNum-2)+""].loaded && !self.cache[(self.totalNum-1)+""].loaded){
						var num = Math.floor(100 / self.totalNum).toFixed(2);
						var page = self.cache[(self.totalNum-1)+""].page;
						var container = self.cache[(self.totalNum-1)+""].container;
						var pageNum = (self.totalNum-1);
						var scaledViewport = self.cache[pageNum+""].scaledViewport;
						self.cache[pageNum+""].loaded = true;
						self.renderSvg(page,scaledViewport,pageNum,num,container,options)
					}
				}
				var arr1 = self.eventType["scroll"];
				if (arr1 && arr1 instanceof Array) {
					for (var i = 0; i < arr1.length; i++) {
						arr1[i] && arr1[i].call(self,scrollTop)
					}
				}
			})
			this.backTop.on('click tap', function () {
				var mart = self.viewer.css('transform');
				var arr = mart.replace(/[a-z\(\)\s]/g, '').split(',');
				var s1 = arr[0];
				var s2 = arr[3];
				var x = arr[4] / 2;
				var left = self.viewer[0].getBoundingClientRect().left;
				if (left <= -self.docWidth * 2) {
					x = -self.docWidth / 2
				}
				self.viewer.css({
					transform: 'scale(' + s1 + ', ' + s2 + ') translate(' + x + 'px, 0px)'
				})
				if (self.pinchZoom) {
					self.pinchZoom.offset.y = 0;
					self.pinchZoom.lastclientY = 0;
				}
				self.viewerContainer.animate({
					scrollTop: 0
				}, 300)
				var arr1 = self.eventType["backTop"];
				if (arr1 && arr1 instanceof Array) {
					for (var i = 0; i < arr1.length; i++) {
						arr1[i] && arr1[i].call(self)
					}
				}
			})
			//获取url带的参数地址
			function GetQueryString(name) {
				var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
				var r = window.location.search.substr(1).match(reg);
				if (r != null) return decodeURIComponent(r[2]);
				return "";
			}
			var pdfurl = GetQueryString("file");

			if (pdfurl && options.URIenable) {
				self.renderPdf(options, {
					url: pdfurl
				})
			} else if (options.pdfurl) {
				self.renderPdf(options, {
					url: options.pdfurl
				})
			} else if (options.data) {
				self.renderPdf(options, {
					data: options.data
				})
			} else {
				var time = new Date().getTime();
				self.endTime = time - self.initTime;
				var arr1 = self.eventType["complete"];
				if (arr1 && arr1 instanceof Array) {
					for (var i = 0; i < arr1.length; i++) {
						arr1[i] && arr1[i].call(self, "error", "Expect options.pdfurl or options.data!", self.endTime)
					}
				}
				var arr2 = self.eventType["error"];
				if (arr2 && arr2 instanceof Array) {
					for (var i = 0; i < arr2.length; i++) {
						arr2[i] && arr2[i].call(self, "Expect options.pdfurl or options.data!", self.endTime)
					}
				}
				throw Error("Expect options.pdfurl or options.data!")
			}

		},
		renderPdf: function (options, obj) {
			var self = this;
			pdfjsLib.getDocument(obj).then(function (pdf) {
				self.thePDF = pdf;
				self.totalNum = pdf.numPages;
				self.pageTotal.text(self.totalNum)
				var arr1 = self.eventType["ready"];
				if (arr1 && arr1 instanceof Array) {
					for (var i = 0; i < arr1.length; i++) {
						arr1[i] && arr1[i].call(self)
					}
				}
				var promise = Promise.resolve();
				var num = Math.floor(100 / self.totalNum).toFixed(2);
				self.progress.css({
					width: "1%"
				})
				for (var i = 1; i <= self.totalNum; i++) {
					promise = promise.then(function (pageNum) {
						return self.thePDF.getPage(pageNum).then(function (page) {
							self.cache[pageNum+""] = {
								page:page,
								loaded:false,
								container:null,
								scaledViewport:null
							};
							var viewport = page.getViewport(options.scale);
							var scale = (self.docWidth / viewport.width).toFixed(2)
							var scaledViewport = page.getViewport(scale)
							var container = document.createElement('div');
							container.id = 'pageContainer' + pageNum;
							container.className = 'pageContainer';
							container.setAttribute('name', 'page=' + pageNum);
							container.setAttribute('title', 'Page ' + pageNum);
							if(options.fullscreen === false && viewport.width<self.docWidth){
								scaledViewport = viewport;
								container.style.width = scaledViewport.width + 'px';
							}
							var loadEffect = document.createElement('div');
							loadEffect.className = 'loadEffect';
							container.appendChild(loadEffect);
							container.style.height = scaledViewport.height + 'px';
							self.viewer[0].appendChild(container);
							self.cache[pageNum+""].container = container;
							self.cache[pageNum+""].scaledViewport = scaledViewport;
							if(self.currentNum<pageNum && options.lazy){
								return 
							}
							self.cache["1"].loaded = true;
							return self.renderSvg(page,scaledViewport,pageNum,num,container,options)
						});
					}.bind(null, i));
				}
			}).catch(function (err) {
				var time = new Date().getTime();
				self.endTime = time - self.initTime;
				var arr1 = self.eventType["complete"];
				if (arr1 && arr1 instanceof Array) {
					for (var i = 0; i < arr1.length; i++) {
						arr1[i] && arr1[i].call(self, "error", err.message, self.endTime)
					}
				}
				var arr2 = self.eventType["error"];
				if (arr2 && arr2 instanceof Array) {
					for (var i = 0; i < arr2.length; i++) {
						arr2[i] && arr2[i].call(self, err.message, self.endTime)
					}
				}
			})
		},
		finalRender:function(options){
			var time = new Date().getTime();
			var self = this;
			self.progress.css({
				width: "100%"
			});
			self.loadingBar.hide();
			self.endTime = time - self.initTime;
			if(self.totalNum!==1){
				self.cache[(self.totalNum-1)+""].loaded = true;
			}else {
				self.cache["1"].loaded = true;
			}
			if (options.zoomEnable) {
				self.pinchZoom = new PinchZoom(self.viewer, {}, self.viewerContainer);
				self.pinchZoom.done = function (scale) {
					if (scale == 1) {
						if (self.viewerContainer) {
							self.viewerContainer.css({
								'-webkit-overflow-scrolling': 'touch'
							})
						}

					} else {
						if (self.viewerContainer) {
							self.viewerContainer.css({
								'-webkit-overflow-scrolling': 'auto'
							})
						}
					}
					var arr1 = self.eventType["zoom"];
					if (arr1 && arr1 instanceof Array) {
						for (var i = 0; i < arr1.length; i++) {
							arr1[i] && arr1[i].call(self)
						}
					}
				}
			}
			var arr1 = self.eventType["complete"];
			if (arr1 && arr1 instanceof Array) {
				for (var i = 0; i < arr1.length; i++) {
					arr1[i] && arr1[i].call(self, "success", "pdf加载完成", self.endTime)
				}
			}
			var arr2 = self.eventType["success"];
			if (arr2 && arr2 instanceof Array) {
				for (var i = 0; i < arr2.length; i++) {
					arr2[i] && arr2[i].call(self, self.endTime)
				}
			}
		},
		renderSvg:function(page,scaledViewport,pageNum,num,container,options){
			var self = this;
			return	page.getOperatorList().then(function (opList) {
				var svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs);
				return svgGfx.getSVG(opList, scaledViewport).then(function (svg) {
					container.children[0].style.display = "none";
					container.appendChild(svg);
					svg.style.width = "100%";
					// self.viewer[0].style.width = document.querySelector('.pageContainer').getBoundingClientRect().width + 'px';
					self.progress.css({
						width: num * pageNum+ "%"
					})
					var time = new Date().getTime();
					var arr1 = self.eventType["render"];
					if (arr1 && arr1 instanceof Array) {
						for (var i = 0; i < arr1.length; i++) {
							arr1[i] && arr1[i].call(self, pageNum, time - self.initTime, container)
						}
					}
					if (pageNum === self.totalNum) {
						self.finalRender(options)
					}
				});
			});
		},
		show: function (callback) {
			this.container.show();
			callback && callback.call(this)
			var arr = this.eventType["show"];
			if (arr && arr instanceof Array) {
				for (var i = 0; i < arr.length; i++) {
					arr[i] && arr[i].call(this)
				}
			}
		},
		hide: function (callback) {
			this.container.hide()
			callback && callback.call(this)
			var arr = this.eventType["hide"];
			if (arr && arr instanceof Array) {
				for (var i = 0; i < arr.length; i++) {
					arr[i] && arr[i].call(this)
				}
			}
		},
		on: function (type, callback) {
			if (this.eventType[type] && this.eventType[type] instanceof Array) {
				this.eventType[type].push(callback)
			}
			this.eventType[type] = [callback]
		},
		scrollEnable: function (flag) {
			if (flag === false) {
				this.viewerContainer.css({
					"overflow": "hidden"
				})
			} else {
				this.viewerContainer.css({
					"overflow": "auto"
				})
			}
			var arr = this.eventType["scrollEnable"];
			if (arr && arr instanceof Array) {
				for (var i = 0; i < arr.length; i++) {
					arr[i] && arr[i].call(this, flag)
				}
			}
		},
		zoomEnable: function (flag) {
			if (flag === false) {
				this.pinchZoom.disable()
			} else {
				this.pinchZoom.enable()
			}
			var arr = this.eventType["zoomEnable"];
			if (arr && arr instanceof Array) {
				for (var i = 0; i < arr.length; i++) {
					arr[i] && arr[i].call(this, flag)
				}
			}
		},
		reset: function (callback) {
			if (this.pinchZoom) {
				this.pinchZoom.offset.y = 0;
				this.pinchZoom.offset.x = 0;
				this.pinchZoom.lastclientY = 0;
				this.pinchZoom.zoomFactor = 1;
				this.pinchZoom.update();
			}
			if (this.viewerContainer) {
				this.viewerContainer.scrollTop(0);
			}
			callback && callback.call(this)
			var arr = this.eventType["reset"];
			if (arr && arr instanceof Array) {
				for (var i = 0; i < arr.length; i++) {
					arr[i] && arr[i].call(this, flag)
				}
			}
		},
		destroy: function (callback) {
			this.reset();
			if (this.thePDF) {
				this.thePDF.destroy();
				this.thePDF = null;
			}
			if (this.viewerContainer) {
				this.viewerContainer.remove();
				this.viewerContainer = null;
			}
			if (this.container) {
				this.container.html('');
				this.container = null;
			}
			this.totalNum = null;
			this.pages = null;
			this.initTime = 0;
			this.endTime = 0;
			this.viewer = null;
			this.pageNum = null;
			this.pageNow = null;
			this.pageTotal = null;
			this.loadingBar = null;
			this.progress = null;
			this.timer = null;
			this.show = null;
			this.hide = null;
			callback && callback.call(this)
			var arr = this.eventType["destroy"];
			if (arr && arr instanceof Array) {
				for (var i = 0; i < arr.length; i++) {
					arr[i] && arr[i].call(this, flag)
				}
			}
		}
	}

	if (typeof exports === 'object' && typeof module === 'object') {
		module.exports = Pdfh5;
	}else if(typeof exports === 'object'){
		exports["pdfh5/dist/pdfh5"] = Pdfh5;
	}else if (typeof define !== 'undefined' && define.amd) {
		define("pdfh5/dist/pdfh5",[], function () {
			return Pdfh5
		});
	} else if (typeof window !== 'undefined') {
		window["pdfh5/dist/pdfh5"] = window.Pdfh5 = Pdfh5
	}
}).call(this);