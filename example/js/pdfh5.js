(function() {
	'use strict';
	var definePinchZoom = function($) {
		var PinchZoom = function(el, options, viewerContainer) {
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
			sum = function(a, b) {
				return a + b;
			},
			isCloseTo = function(value, expected) {
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
			handleDragStart: function(event) {
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
			handleDrag: function(event) {

				if (this.zoomFactor > 1.0) {
					var touch = this.getTouches(event)[0];
					this.drag(touch, this.lastDragPosition, event);
					this.offset = this.sanitizeOffset(this.offset);
					this.lastDragPosition = touch;
				}
			},

			handleDragEnd: function() {
				this.el.trigger(this.options.dragEndEventName);
				this.end();
			},

			/**
			 * Event handler for 'zoomstart'
			 * @param event
			 */
			handleZoomStart: function(event) {
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
			handleZoom: function(event, newScale) {

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

			handleZoomEnd: function() {
				this.el.trigger(this.options.zoomEndEventName);
				this.end();
			},

			/**
			 * Event handler for 'doubletap'
			 * @param event
			 */
			handleDoubleTap: function(event) {
				var center = this.getTouches(event)[0],
					zoomFactor = this.zoomFactor > 1 ? 1 : this.options.tapZoomFactor,
					startZoomFactor = this.zoomFactor,
					updateProgress = (function(progress) {
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
			sanitizeOffset: function(offset) {
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
			scaleTo: function(zoomFactor, center) {
				this.scale(zoomFactor / this.zoomFactor, center);
			},

			/**
			 * Scales the element from specified center
			 * @param scale
			 * @param center
			 */
			scale: function(scale, center) {
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
			scaleZoomFactor: function(scale) {
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
			drag: function(center, lastCenter, event) {
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
			getTouchCenter: function(touches) {
				return this.getVectorAvg(touches);
			},

			/**
			 * Calculates the average of multiple vectors (x, y values)
			 */
			getVectorAvg: function(vectors) {
				return {
					x: vectors.map(function(v) {
						return v.x;
					}).reduce(sum) / vectors.length,
					y: vectors.map(function(v) {
						return v.y;
					}).reduce(sum) / vectors.length
				};
			},

			/**
			 * Adds an offset
			 * @param offset the offset to add
			 * @return return true when the offset change was accepted
			 */
			addOffset: function(offset) {
				this.offset = {
					x: this.offset.x + offset.x,
					y: this.offset.y + offset.y
				};
			},

			sanitize: function() {
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
			isInsaneOffset: function(offset) {
				var sanitizedOffset = this.sanitizeOffset(offset);
				return sanitizedOffset.x !== offset.x ||
					sanitizedOffset.y !== offset.y;
			},

			/**
			 * Creates an animation moving to a sane offset
			 */
			sanitizeOffsetAnimation: function() {
				var targetOffset = this.sanitizeOffset(this.offset),
					startOffset = {
						x: this.offset.x,
						y: this.offset.y
					},
					updateProgress = (function(progress) {
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
			zoomOutAnimation: function() {
				var startZoomFactor = this.zoomFactor,
					zoomFactor = 1,
					center = this.getCurrentZoomCenter(),
					updateProgress = (function(progress) {
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
			updateAspectRatio: function() {
				this.setContainerY(this.getContainerX() / this.getAspectRatio());
			},

			/**
			 * Calculates the initial zoom factor (for the element to fit into the container)
			 * @return the initial zoom factor
			 */
			getInitialZoomFactor: function() {
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
			getAspectRatio: function() {
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
			getCurrentZoomCenter: function() {

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

			canDrag: function() {
				return !isCloseTo(this.zoomFactor, 1);
			},

			/**
			 * Returns the touches of an event relative to the container offset
			 * @param event
			 * @return array touches
			 */
			getTouches: function(event) {
				var position = this.container.offset();
				return Array.prototype.slice.call(event.touches).map(function(touch) {
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
			animate: function(duration, framefn, timefn, callback) {
				var startTime = new Date().getTime(),
					renderFrame = (function() {
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
			stopAnimation: function() {
				this.inAnimation = false;

			},

			/**
			 * Swing timing function for animations
			 * @param p
			 * @return {Number}
			 */
			swing: function(p) {
				return -Math.cos(p * Math.PI) / 2 + 0.5;
			},

			getContainerX: function() {
				if (this.el[0]) {
					return this.el[0].offsetWidth;
				} else {
					return 0;
				}
			},

			getContainerY: function() {
				return this.el[0].offsetHeight;
			},
			setContainerY: function(y) {
				y = y.toFixed(2);
				return this.container.height(y);
			},

			/**
			 * Creates the expected html structure
			 */
			setupMarkup: function() {
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

			end: function() {
				this.hasInteraction = false;
				this.sanitize();
				this.update();

			},

			/**
			 * Binds all required event listeners
			 */
			bindEvents: function() {
				detectGestures(this.container.eq(0), this, this.viewerContainer);
				// Zepto and jQuery both know about `on`
				$(window).on('resize', this.update.bind(this));
				$(this.el).find('img').on('load', this.update.bind(this));

			},

			/**
			 * Updates the css values according to the current zoom factor and offset
			 */
			update: function() {

				if (this.updatePlaned) {
					return;
				}
				this.updatePlaned = true;
				setTimeout((function() {
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
						removeClone = (function() {
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
			enable: function() {
				this.enabled = true;

			},

			/**
			 * Disables event handling for gestures
			 */
			disable: function() {
				this.enabled = false;
			},
			//销毁还原
			destroy: function() {
				var dom = this.el.clone();
				var p = this.container.parent();
				this.container.remove();
				dom.removeAttr('style');
				p.append(dom);
			}
		};

		var detectGestures = function(el, target, viewerContainer) {
			var interaction = null,
				fingers = 0,
				lastTouchStart = null,
				startTouches = null,
				lastTouchY = null,
				clientY = null,
				lastclientY = 0,
				lastTop = 0,
				setInteraction = function(newInteraction, event) {
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

				updateInteraction = function(event) {
					if (fingers === 2) {
						setInteraction('zoom');
					} else if (fingers === 1 && target.canDrag()) {
						setInteraction('drag', event);
					} else {
						setInteraction(null, event);
					}
				},

				targetTouches = function(touches) {
					return Array.prototype.slice.call(touches).map(function(touch) {
						return {
							x: touch.pageX,
							y: touch.pageY
						};
					});
				},

				getDistance = function(a, b) {
					var x, y;
					x = a.x - b.x;
					y = a.y - b.y;
					return Math.sqrt(x * x + y * y);
				},

				calculateScale = function(startTouches, endTouches) {
					var startDistance = getDistance(startTouches[0], startTouches[1]),
						endDistance = getDistance(endTouches[0], endTouches[1]);
					return endDistance / startDistance;
				},

				cancelEvent = function(event) {
					event.stopPropagation();
					event.preventDefault();
				},

				detectDoubleTap = function(event) {
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
				parentNode.addEventListener('touchstart', function(event) {
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

				parentNode.addEventListener('touchmove', function(event) {
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

				parentNode.addEventListener('touchend', function(event) {
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
	var Pdfh5 = function(dom, options) {
		this.container = $(dom);
		this.currentNum = 1; //当前页数从1开始
		this.thePDF = null;
		this.pdfRender = null;
		this.totalNum = null;
		this.pdfLoaded = false;
		this.pages = null;
		this.initTime = 0;
		this.startTime = 0;
		this.endTime = 0;
		this.renderTime = 0;
		this.timer = null;
		this.loadWidth = 1;
		this.docWidth = document.documentElement.clientWidth;
		this.eventType = {};
		this.init(options);
	};
	Pdfh5.prototype = {

		init: function(options) {
			var self = this;
			if (self.pdfLoaded) {
				return;
			}
			this.initTime = new Date().getTime();
			setTimeout(function() {
				self.eventType["start"] && self.eventType["start"].call(self, self.initTime);
				self.start && self.start(self.initTime)
			}, 0)
			options = options ? options : {};
			options.pdfurl = options.pdfurl ? options.pdfurl : null;
			options.data = options.data ? options.data : null;
			if (options.scrollEnable == 'undefined' || options.scrollEnable == undefined) {
				options.scrollEnable = true
			}
			if (options.scrollEnable == 'true' || options.scrollEnable == true) {
				options.scrollEnable = true
			}
			if (options.scrollEnable == 'null' || options.scrollEnable == null) {
				options.scrollEnable = true
			}
			if (options.scrollEnable == 'false') {
				options.scrollEnable = false
			}

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
				'</div>' +
				'<div class="loadEffect"></div>';
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
			this.loading = this.container.find('.loadEffect');
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
			viewerContainer.addEventListener('scroll', function() {
				var scrollTop = viewerContainer.scrollTop;
				if (scrollTop >= 150) {
					if (self.backTop) {
						self.backTop.show();
					}
				} else {
					if (self.backTop) {
						self.backTop.fadeOut(200);
					}
				}
				if (self.viewerContainer) {
					self.pages = self.viewerContainer.find('.page');
				}
				clearTimeout(self.timer);
				if (self.pageNum) {
					self.pageNum.show();
				}
				if (self.pages) {
					self.pages.each(function(index, obj) {
						var top = obj.getBoundingClientRect().top;
						var bottom = obj.getBoundingClientRect().bottom;
						if (top <= height && bottom > height) {
							if (self.pageNum) {
								self.pageNow.text(index + 1)
							}
						}
					})
				}
				self.timer = setTimeout(function() {
					if (self.pageNum) {
						self.pageNum.fadeOut(200);
					}
				}, 1500)
				self.eventType["scroll"] && self.eventType["scroll"].call(self, scrollTop);
				self.scroll && self.scroll(scrollTop);
			})
			this.backTop.on('click tap', function() {
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
				if (self.PinchZoom) {
					self.PinchZoom.offset.y = 0;
					self.PinchZoom.lastclientY = 0;
				}
				self.viewerContainer.animate({
					scrollTop: 0
				}, 300)
				self.eventType["backTop"] && self.eventType["backTop"].call(self);
			})
			//获取url带的参数地址
			function GetQueryString(name) {
				var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
				var r = window.location.search.substr(1).match(reg);
				if (r != null) return decodeURIComponent(r[2]);
				return "";
			}
			var pdfurl = GetQueryString("file");
			if (pdfurl) {
				getDoc(pdfurl)
			} else if (options.pdfurl) {
				getDoc(options.pdfurl)
			} else {
				setTimeout(function() {
					var time = new Date().getTime();
					self.endTime = time - self.initTime;
					self.eventType["complete"] && self.eventType["complete"].call(self, "error", "文件路径不能为空", self.endTime);
					self.eventType["error"] && self.eventType["complete"].call(self, "error", "文件路径不能为空", self.endTime);
					self.complete && self.complete("error", "文件路径不能为空", self.endTime)
					self.error && self.error("error", "文件路径不能为空", self.endTime)
				}, 0)
			}

			function getDoc(array) {
				if (self.pdfLoaded) {
					return;
				}
				pdfjsLib.getDocument(array).then(function(pdf) {
					if (self.pdfLoaded) {
						return;
					}
					self.thePDF = pdf;
					self.totalNum = pdf.numPages;
					self.thePDF.getPage(1).then(handlePages);
					self.pageTotal.text(self.totalNum)
					var time = new Date().getTime();
					self.startTime = time - self.initTime;
					self.eventType["renderStart"] && self.eventType["renderStart"].call(self, self.startTime);
					self.renderStart && self.renderStart(self.startTime)
				}).catch(function(err) {
					var time = new Date().getTime();
					self.endTime = time - self.initTime;
					self.eventType["complete"] && self.eventType["complete"].call(self, "error", err.responseText, self.endTime);
					self.eventType["error"] && self.eventType["complete"].call(self, "error", err.responseText, self.endTime);
					self.complete && self.complete("error", err.responseText, self.endTime)
					self.error && self.error("error", err.responseText, self.endTime)
				})
			}

			function handlePages(page) {
				if (self.pdfLoaded) {
					return;
				}
				if (!options || !options.scale) {
					if (self.totalNum === 1) {
						options.scale = 1.8
					} else {
						options.scale = 2.5
						// options.scale = 1.8
					}
				}
				if (options && options.defalutScale) {
					if (self.totalNum === 1) {
						options.scale = options.defalutScale
						// options.scale = 1.8
					} else {
						options.scale = 2.5
						// options.scale = 1.8
					}
				}
				var viewport = page.getViewport(options.scale);
				var canvas = document.createElement("canvas");
				var winRatio = ($(window).width() / viewport.width) * 1;
				var obj = {
					'Cheight': viewport.height * winRatio,
					'width': viewport.width,
					'height': viewport.height,
					'canvas': canvas,
					'index': self.currentNum
				}
				var context = canvas.getContext('2d');
				canvas.height = viewport.height;
				canvas.width = viewport.width;
				//在canvas上绘制
				self.pdfRender = page.render({
					canvasContext: context,
					viewport: viewport
				});
				obj.src = obj.canvas.toDataURL("image/jpeg");

				self.pdfRender.promise.then(function() {
					self.render(obj);
				}).then(function() {
					//开始下一页到绘制
					self.currentNum++;

					if (!self.pdfLoaded && self.thePDF && self.currentNum <= self.totalNum) {
						self.thePDF.getPage(self.currentNum).then(handlePages);
					} else {
						self.pdfLoaded = true;
						if (self.viewerContainer) {
							self.pages = self.viewerContainer.find('.page');
						}
						self.currentNum = self.totalNum;
						var time = new Date().getTime();
						self.endTime = time - self.initTime;
						if (self.progress) {
							self.progress.css({
								width: "100%"
							})
						}
						if (self.loadingBar) {
							self.loadingBar.fadeOut(200);
						}
						self.renderEnd && self.renderEnd(self.endTime)
						self.eventType["complete"] && self.eventType["complete"].call(self, "success", "PDF解析完毕", self.endTime);
						self.eventType["success"] && self.eventType["success"].call(self, "success", "PDF解析完毕", self.endTime);
						self.complete && self.complete("success", "PDF解析完毕", self.endTime)
						self.success && self.success("success", "PDF解析完毕", self.endTime)
						self.PinchZoom = new PinchZoom(self.viewer, {}, self.viewerContainer);

						self.PinchZoom.done = function(scale) {
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
							self.zoomChange && self.zoomChange(scale)
						}
					}
				}).catch(function(err) {
					console.log(err)
				})

			}
		},
		render: function(obj) {
			if (this.pdfLoaded) {
				return;
			}
			var img = new Image();
			var time = new Date().getTime();
			var time2 = 0;
			if (this.renderTime == 0) {
				time2 = time - this.startTime
			} else {
				time2 = time - this.renderTime
			}
			obj.src = obj.canvas.toDataURL("image/jpeg");
			img.src = obj.src;
			var page = document.createElement("div");
			page.className = "page page" + obj.index;
			page.setAttribute('data-index', obj.index);
			$(page).css({
				'max-width': obj.width
			})
			page.appendChild(img);
			if (this.viewer) {
				this.viewer.append(page);
			}
			if (this.currentNum == 1) {
				this.loadWidth = 100 / this.totalNum;
				if (this.loadingBa) {
					this.loadingBar.show();
				}
				if (this.loading) {
					this.loading.fadeOut(200);
				}
			}
			if (this.progress) {
				this.progress.css({
					width: this.loadWidth * this.currentNum + "%"
				})
			}
			this.eventType["renderPages"] && this.eventType["renderPages"].call(this, page, time - this.initTime, time2);
			this.renderPages && this.renderPages(page, time - this.initTime, time2)
			this.renderTime = time;
		},
		show: function(callback) {
			this.container.show();
			this.eventType["show"] && this.eventType["show"].call(this);
			callback && callback.call(this)
		},
		hide: function(callback) {
			this.container.hide()
			this.eventType["hide"] && this.eventType["show"].call(this);
			callback && callback.call(this)
		},
		on: function(type, callback) {
			this.eventType[type] = callback
		},
		scrollEnable: function(flag) {
			if (!flag) {
				this.viewerContainer.css({
					"overflow": "hidden"
				})
			} else {
				this.viewerContainer.css({
					"overflow": "auto"
				})
			}
			this.eventType["scrollEnable"] && this.eventType["scrollEnable"].call(this);
		},
		reset: function(callback) {
			if (this.PinchZoom) {
				this.PinchZoom.offset.y = 0;
				this.PinchZoom.offset.x = 0;
				this.PinchZoom.lastclientY = 0;
				this.PinchZoom.zoomFactor = 1;
				this.PinchZoom.update();
			}
			if (this.viewerContainer) {
				this.viewerContainer.scrollTop(0);
			}
			this.eventType["reset"] && this.eventType["reset"].call(this);
			callback && callback.call(this)
		},
		destroy: function(callback) {
			var self = this;
			this.reset();
			if (this.thePDF) {
				this.thePDF.destroy();
				this.thePDF = null;
			}
			if (this.pdfRender) {
				this.pdfRender.cancel();
				this.pdfRender = null;
			}
			if (this.viewerContainer) {
				this.viewerContainer.remove();
				this.viewerContainer = null;
			}
			if (this.container) {
				this.container.html('');
				this.container = null;
			}
			this.backTop.off('tap');
			this.backTop.off('click');
			this.pdfLoaded = true;
			this.currentNum = 1;
			this.totalNum = null;
			this.pages = null;
			this.initTime = 0;
			this.startTime = 0;
			this.endTime = 0;
			this.renderTime = 0;
			this.viewer = null;
			this.pageNum = null;
			this.pageNow = null;
			this.pageTotal = null;
			this.loadingBar = null;
			this.progress = null;
			this.loading = null;
			this.timer = null;
			this.loadWidth = 1;
			this.show = null;
			this.hide = null;
			callback && callback.call(this)
			this.eventType["destroy"] && this.eventType["destroy"].call(this)
		}
	}
	if (typeof define !== 'undefined' && define.amd) {
		define(['jquery'], function($) {
			return Pdfh5
		});
	} else {
		window.Pdfh5 = Pdfh5
	}
}).call(this);
