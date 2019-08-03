
; (function (g, fn) {
    if (typeof require !== 'undefined') {
        g.$ = require('./jquery-1.11.3.min.js');
        g.pdfjsWorker = require('./pdf.worker.js');
        g.pdfjsLib = require('./pdf.js');
    }
    var pdfjsLib = g.pdfjsLib, $ = g.$, pdfjsWorker = g.pdfjsWorker;
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return fn(g, pdfjsWorker, pdfjsLib, $)
        })
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = fn(g, pdfjsWorker, pdfjsLib, $)
    } else {
        g.Pdfh5 = fn(g, pdfjsWorker, pdfjsLib, $)
    }
})(typeof window !== 'undefined' ? window : this, function (g, pdfjsWorker, pdfjsLib, $) {
    'use strict';
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
            this.options.tapZoomFactor = isNaN(options.tapZoomFactor) ? 2 : options.tapZoomFactor;
            this.options.zoomOutFactor = isNaN(options.zoomOutFactor) ? 1.2 : options.zoomOutFactor;
            this.options.animationDuration = isNaN(options.animationDuration) ? 300 : options.animationDuration;
            this.options.maxZoom = isNaN(options.maxZoom) ? 4 : options.maxZoom;
            this.options.minZoom = isNaN(options.minZoom) ? 0.8 : options.minZoom;
            this.setupMarkup();
            this.bindEvents();
            this.update();
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
            handleDragStart: function (event) {
                this.el.trigger(this.options.dragStartEventName);
                this.stopAnimation();
                this.lastDragPosition = false;
                this.hasInteraction = true;
                this.handleDrag(event);
            },
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
            handleZoomStart: function (event) {
                this.el.trigger(this.options.zoomStartEventName);
                this.stopAnimation();
                this.lastScale = 1;
                this.nthZoom = 0;
                this.lastZoomCenter = false;
                this.hasInteraction = true;
            },
            handleZoom: function (event, newScale) {
                var touchCenter = this.getTouchCenter(this.getTouches(event)),
                    scale = newScale / this.lastScale;
                this.lastScale = newScale;
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
            scaleTo: function (zoomFactor, center) {
                this.scale(zoomFactor / this.zoomFactor, center);
            },
            scale: function (scale, center) {
                scale = this.scaleZoomFactor(scale);
                this.addOffset({
                    x: (scale - 1) * (center.x + this.offset.x),
                    y: (scale - 1) * (center.y + this.offset.y)
                });
            },
            scaleZoomFactor: function (scale) {
                var originalZoomFactor = this.zoomFactor;
                this.zoomFactor *= scale;
                this.zoomFactor = Math.min(this.options.maxZoom, Math.max(this.zoomFactor, this.options.minZoom));
                return this.zoomFactor / originalZoomFactor;
            },
            drag: function (center, lastCenter, event) {
                if (lastCenter) {
                    if (this.options.lockDragAxis) {
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
            getTouchCenter: function (touches) {
                return this.getVectorAvg(touches);
            },
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
            isInsaneOffset: function (offset) {
                var sanitizedOffset = this.sanitizeOffset(offset);
                return sanitizedOffset.x !== offset.x ||
                    sanitizedOffset.y !== offset.y;
            },
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
            updateAspectRatio: function () {
                this.setContainerY(this.getContainerX() / this.getAspectRatio());
            },
            getInitialZoomFactor: function () {
                if (this.container[0] && this.el[0]) {
                    return this.container[0].offsetWidth / this.el[0].offsetWidth;
                } else {
                    return 0
                }
            },
            getAspectRatio: function () {
                if (this.el[0]) {
                    var offsetHeight = this.el[0].offsetHeight;
                    return this.container[0].offsetWidth / offsetHeight;
                } else {
                    return 0
                }

            },
            getCurrentZoomCenter: function () {
                var length = this.container[0].offsetWidth * this.zoomFactor,
                    offsetLeft = this.offset.x,
                    offsetRight = length - offsetLeft - this.container[0].offsetWidth,
                    widthOffsetRatio = offsetLeft / offsetRight,
                    centerX = widthOffsetRatio * this.container[0].offsetWidth / (widthOffsetRatio + 1),

                    height = this.container[0].offsetHeight * this.zoomFactor,
                    offsetTop = this.offset.y,
                    offsetBottom = height - offsetTop - this.container[0].offsetHeight,
                    heightOffsetRatio = offsetTop / offsetBottom,
                    centerY = heightOffsetRatio * this.container[0].offsetHeight / (heightOffsetRatio + 1);

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

            getTouches: function (event) {
                var position = this.container.offset();
                return Array.prototype.slice.call(event.touches).map(function (touch) {
                    return {
                        x: touch.pageX - position.left,
                        y: touch.pageY - position.top
                    };
                });
            },
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
            stopAnimation: function () {
                this.inAnimation = false;

            },
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
            setupMarkup: function () {
                this.container = $('<div class="pinch-zoom-container"></div>');
                this.el.before(this.container);
                this.container.append(this.el);

                this.container.css({
                    'position': 'relative',
                });

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
            bindEvents: function () {
                detectGestures(this.container.eq(0), this, this.viewerContainer);
                $(g).on('resize', this.update.bind(this));
                $(this.el).find('img').on('load', this.update.bind(this));

            },
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
                    if (!this.options.use2d || this.hasInteraction || this.inAnimation) {
                        this.is3d = true;
                        this.el.css({
                            '-webkit-transform': transform3d,
                            '-o-transform': transform2d,
                            '-ms-transform': transform2d,
                            '-moz-transform': transform2d,
                            'transform': transform3d
                        });
                    } else {
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
            enable: function () {
                this.enabled = true;
            },
            disable: function () {
                this.enabled = false;
            },
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
        this.loadedCount = 0;
        this.endTime = 0;
        this.pinchZoom = null;
        this.timer = null;
        this.docWidth = document.documentElement.clientWidth;
        this.eventType = {};
        this.cache = {};
        this.cacheNum = 1;
        this.options = options;
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
                        arr1[i] && arr1[i].call(self, self.initTime)
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
            options.renderType = options.renderType === "canvas" ? "canvas" : "svg";
            options.type = options.type === "ajax" ? "ajax" : "fetch";
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
                '</div>'+
                '<div class="loadEffect loading"></div>';
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
            this.loading = this.container.find('.loading');
            if (!options.loadingBar) {
                this.loadingBar.hide()
            }
            var containerH = this.container.height(),
                height = containerH * (1 / 3);

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
                var h = containerH;
                if (self.pages) {
                    self.pages.each(function (index, obj) {
                        var top = obj.getBoundingClientRect().top;
                        var bottom = obj.getBoundingClientRect().bottom;
                        if (top <= height && bottom > height) {
                            if (options.pageNum) {
                                self.pageNow.text(index + 1)
                            }
                            self.currentNum = index + 1;
                        }
                        if (top <= h && bottom > h) {
                            self.cacheNum = index + 1;
                        }
                    })
                }
                self.timer = setTimeout(function () {
                    if (options.pageNum) {
                        self.pageNum.fadeOut(200);
                    }
                }, 1500)
                if (options.lazy && options.renderType === "svg") {
                    var num = Math.floor(100 / self.totalNum).toFixed(2);
                    if (!self.cache[self.cacheNum + ""].loaded) {
                        var page = self.cache[self.cacheNum + ""].page;
                        var container = self.cache[self.cacheNum + ""].container;
                        var pageNum = self.cacheNum;
                        self.cache[pageNum + ""].loaded = true;
                        var scaledViewport = self.cache[pageNum + ""].scaledViewport;
                        self.renderSvg(page, scaledViewport, pageNum, num, container, options)
                    }
                    if (self.cache[(self.totalNum - 1) + ""].loaded && !self.cache[self.totalNum + ""].loaded) {
                        var page = self.cache[self.totalNum + ""].page;
                        var container = self.cache[self.totalNum + ""].container;
                        var pageNum = self.totalNum;
                        self.cache[pageNum + ""].loaded = true;
                        var scaledViewport = self.cache[pageNum + ""].scaledViewport;
                        self.renderSvg(page, scaledViewport, pageNum, num, container, options)
                    }
                }
                var arr1 = self.eventType["scroll"];
                if (arr1 && arr1 instanceof Array) {
                    for (var i = 0; i < arr1.length; i++) {
                        arr1[i] && arr1[i].call(self, scrollTop)
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
                var r = g.location.search.substr(1).match(reg);
                if (r != null) return decodeURIComponent(r[2]);
                return "";
            }
            var pdfurl = GetQueryString("file"), url = "";
            if (pdfurl && options.URIenable) {
                url = pdfurl
            } else if (options.pdfurl) {
                url = options.pdfurl
            }
            if (url) {
                if (options.type === "ajax") {
                    $.ajax({
                        type: "get",
                        mimeType: 'text/plain; charset=x-user-defined',
                        cache:false,
                        url: url,
                        success: function (data) {
                            var rawLength = data.length;
                            var array = new Uint8Array(new ArrayBuffer(rawLength));
                            for (i = 0; i < rawLength; i++) {
                                array[i] = data.charCodeAt(i) & 0xff;
                            }
                            if (options.renderType === "svg") {
                                self.renderPdf(options, {
                                    data: array
                                })
                            } else {
                                self.renderOld(options, {
                                    data: array
                                })
                            }
                        },
                        error: function (err) {
                            self.loading.hide()
                            var time = new Date().getTime();
                            self.endTime = time - self.initTime;
                            var arr1 = self.eventType["complete"];
                            if (arr1 && arr1 instanceof Array) {
                                for (var i = 0; i < arr1.length; i++) {
                                    arr1[i] && arr1[i].call(self, "error", err.statusText, self.endTime)
                                }
                            }
                            var arr2 = self.eventType["error"];
                            if (arr2 && arr2 instanceof Array) {
                                for (var i = 0; i < arr2.length; i++) {
                                    arr2[i] && arr2[i].call(self, err.statusText, self.endTime)
                                }
                            }
                            throw Error(err.statusText)
                        }
                    });
                } else {
                    if (options.renderType === "svg") {
                        self.renderPdf(options, {
                            url: url
                        })
                    } else {
                        self.renderOld(options, {
                            url: url
                        })
                    }
                }
            } else if (options.data) {
                if (options.renderType === "svg") {
                    self.renderPdf(options, {
                        data: options.data
                    })
                } else {
                    self.renderOld(options, {
                        data: options.data
                    })
                }
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
            obj.cMapUrl = './cmaps/';
            obj.cMapPacked = true;
            pdfjsLib.getDocument(obj).then(function (pdf) {
                self.loading.hide()
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
                    self.cache[i + ""] = {
                        page: null,
                        loaded: false,
                        container: null,
                        scaledViewport: null
                    };
                    promise = promise.then(function (pageNum) {
                        return self.thePDF.getPage(pageNum).then(function (page) {
                            self.cache[pageNum + ""].page = page
                            var viewport = page.getViewport(options.scale);
                            var scale = (self.docWidth / viewport.width).toFixed(2)
                            var scaledViewport = page.getViewport(scale)
                            var container = document.createElement('div');
                            container.id = 'pageContainer' + pageNum;
                            container.className = 'pageContainer';
                            container.setAttribute('name', 'page=' + pageNum);
                            container.setAttribute('title', 'Page ' + pageNum);
                            var loadEffect = document.createElement('div');
                            loadEffect.className = 'loadEffect';
                            container.appendChild(loadEffect);
                            container.style.height = viewport.height * scale + 'px';
                            $(container).css({
                                'max-width': viewport.width,
                                "max-height": viewport.height
                            })
                            self.viewer[0].appendChild(container);
                            self.cache[pageNum + ""].container = container;
                            self.cache[pageNum + ""].scaledViewport = scaledViewport;
                            var sum = 0, containerH = self.container.height();
                            self.pages = self.viewerContainer.find('.pageContainer');
                            if (self.pages && options.lazy) {
                                self.pages.each(function (index, obj) {
                                    var top = obj.offsetTop;
                                    if (top <= containerH) {
                                        sum = index + 1;
                                        self.cache[sum + ""].loaded = true;
                                    }
                                })
                            }
                            if (pageNum > sum && options.lazy) {
                                return
                            }
                            return self.renderSvg(page, scaledViewport, pageNum, num, container, options)
                        });
                    }.bind(null, i));
                }
            }).catch(function (err) {
                self.loading.hide();
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
        finalRender: function (options) {
            var time = new Date().getTime();
            var self = this;
            self.progress.css({
                width: "100%"
            });
            self.loadingBar.hide();
            self.endTime = time - self.initTime;
            if (options.renderType === "svg") {
                if (self.totalNum !== 1) {
                    self.cache[(self.totalNum - 1) + ""].loaded = true;
                } else {
                    self.cache["1"].loaded = true;
                }
            }
            if (options.zoomEnable) {
                self.pinchZoom = new PinchZoom(self.viewer, {
                    tapZoomFactor: options.tapZoomFactor,
                    zoomOutFactor: options.zoomOutFactor,
                    animationDuration: options.animationDuration,
                    maxZoom: options.maxZoom,
                    minZoom: options.minZoom
                }, self.viewerContainer);
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
                            arr1[i] && arr1[i].call(self, scale)
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
        renderSvg: function (page, scaledViewport, pageNum, num, container, options) {
            var self = this;
            return page.getOperatorList().then(function (opList) {
                var svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs);
                return svgGfx.getSVG(opList, scaledViewport).then(function (svg) {
                    self.loadedCount++;
                    container.children[0].style.display = "none";
                    container.appendChild(svg);
                    svg.style.width = "100%";
                    svg.style.height = "100%";
                    self.progress.css({
                        width: num * self.loadedCount + "%"
                    })
                    var time = new Date().getTime();
                    var arr1 = self.eventType["render"];
                    if (arr1 && arr1 instanceof Array) {
                        for (var i = 0; i < arr1.length; i++) {
                            arr1[i] && arr1[i].call(self, pageNum, time - self.initTime, container)
                        }
                    }
                    if (self.loadedCount === self.totalNum) {
                        self.finalRender(options)
                    }
                });
            });
        },
        renderOld: function (options, obj) {
            var self = this;
            obj.cMapUrl = './cmaps/';
            obj.cMapPacked = true;
            pdfjsLib.getDocument(obj).then(function (pdf) {
                self.thePDF = pdf;
                self.totalNum = pdf.numPages;
                self.progress.css({
                    width: "1%"
                })
                self.loadedCount = 1;
                self.thePDF.getPage(1).then(handlePages);
                self.pageTotal.text(self.totalNum)
                var time = new Date().getTime();
                var arr1 = self.eventType["ready"];
                if (arr1 && arr1 instanceof Array) {
                    for (var i = 0; i < arr1.length; i++) {
                        arr1[i] && arr1[i].call(self)
                    }
                }
            }).catch(function (err) {
                self.loading.hide();
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
            function handlePages(page) {
                var num = Math.floor(100 / self.totalNum).toFixed(2);
                var viewport = page.getViewport(options.scale);
                var scale = (self.docWidth / viewport.width).toFixed(2)
                var canvas = document.createElement("canvas");
                var obj2 = {
                    'Cheight': viewport.height * scale,
                    'width': viewport.width,
                    'height': viewport.height,
                    'canvas': canvas,
                    'index': self.loadedCount
                }
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                //在canvas上绘制
                self.pdfRender = page.render({
                    canvasContext: context,
                    viewport: viewport
                });
                self.progress.css({
                    width: num * self.loadedCount + "%"
                })
                obj2.src = obj2.canvas.toDataURL("image/jpeg");
                self.pdfRender.promise.then(function () {
                    var img = new Image();
                    var time = new Date().getTime();
                    var time2 = 0;
                    if (self.renderTime == 0) {
                        time2 = time - self.startTime
                    } else {
                        time2 = time - self.renderTime
                    }
                    obj2.src = obj2.canvas.toDataURL("image/jpeg");
                    img.src = obj2.src;
                    var container = document.createElement('div');
                    container.id = 'pageContainer' + obj2.index;
                    container.className = 'pageContainer';
                    container.setAttribute('name', 'page=' + obj2.index);
                    container.setAttribute('title', 'Page ' + obj2.index);
                    $(container).css({
                        'max-width': obj2.width
                    })
                    container.appendChild(img);
                    if (self.viewer) {
                        self.viewer.append(container);
                    }
                    var time = new Date().getTime();
                    var arr1 = self.eventType["render"];
                    if (arr1 && arr1 instanceof Array) {
                        for (var i = 0; i < arr1.length; i++) {
                            arr1[i] && arr1[i].call(self, obj2.index, time - self.initTime, container)
                        }
                    }
                }).then(function () {
                    //开始下一页到绘制
                    self.loadedCount++;
                    if (!self.pdfLoaded && self.thePDF && self.loadedCount <= self.totalNum) {
                        self.thePDF.getPage(self.loadedCount).then(handlePages);
                    } else {
                        self.finalRender(options)
                    }
                }).catch(function (err) {
                    console.log(err)
                })
            }
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
            this.loadedCount = 0;
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
    return Pdfh5;
});