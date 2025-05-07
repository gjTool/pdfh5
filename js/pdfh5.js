; (function (g, fn) {
	var version = "2.0.2",
		pdfjsVersion = "2.11.338";
	console.log("pdfh5.js v" + version + " && pdf.js v" + pdfjsVersion + " https://pdfh5.gjtool.cn");
	if (!g.document) {
		throw new Error("pdfh5 requires a window with a document");
	}
	if (typeof require !== 'undefined') {
		if (g["pdfjs-dist/build/pdf.worker"]) {
			g.pdfjsWorker = g["pdfjs-dist/build/pdf.worker"];
		} else {
			g.pdfjsWorker = require("./pdf.worker.js");
		}
		if (g["pdfjs-dist/build/pdf"]) {
			g.pdfjsLib = g["pdfjs-dist/build/pdf"];
		} else {
			g.pdfjsLib = require("./pdf.js");
		}
	}
	var pdfjsLib = g.pdfjsLib,
		pdfjsWorker = g.pdfjsWorker;
	if (typeof define === 'function' && define.amd) {
		define(function () {
			return fn(g, pdfjsWorker, pdfjsLib, version);
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = fn(g, pdfjsWorker, pdfjsLib, version);
	} else {
		g.Pdfh5 = fn(g, pdfjsWorker, pdfjsLib, version);
	}
})(typeof window !== 'undefined' ? window : this, function (g, pdfjsWorker, pdfjsLib, version) {
	'use strict';
	var css = '.pdfjs {width: 100%;height: 100%;overflow: hidden;background: #fff;position: relative;}.pdfjs .viewerContainer {position: relative;width: 100%;height: 100%;overflow: auto;-webkit-overflow-scrolling: touch;transition: all .3s;}.pdfjs .pdfViewer {position: relative;top: 0;left: 0;padding: 10px 8px;}.pdfjs .pdfViewer .pageContainer {width: 100%;margin: 0px auto 8px auto;position: relative;overflow: visible;-webkit-box-shadow: darkgrey 0px 1px 3px 0px;-moz-box-shadow: darkgrey 0px 1px 3px 0px;box-shadow: darkgrey 0px 1px 3px 0px;background-color: white;box-sizing: border-box;}.pdfjs .pdfViewer .pageContainer img {width: 100%;height: 100%;position: relative;z-index: 100;user-select: none;pointer-events: none;}.pdfjs .pdfViewer .pageContainer canvas {width: 100%;height: 100%;position: relative;z-index: 100;user-select: none;pointer-events: none;}.pdfjs .pageNum {padding: 0px 7px;height: 26px;position: absolute;top: 20px;left: 15px;z-index: 997;border-radius: 8px;transition: all .3s;display: none;}.pdfjs .pageNum-bg, .pdfjs .pageNum-num {width: 100%;height: 100%;line-height: 26px;text-align: center;position: absolute;top: 0px;left: 0px;color: #fff;border-radius: 8px;font-size: 16px;}.pdfjs .pageNum-bg {background: rgba(0, 0, 0, 0.5);}.pdfjs .pageNum-num {position: relative;}.pdfjs .pageNum span {color: #fff;font-size: 16px;}.pdfjs .loadingBar {position: absolute;width: 100%;z-index: 99;background: #fff !important;height: 4px;top: 0px;left: 0px;transition: all .3s;}.pdfjs .loadingBar .progress {background: #fff !important;position: absolute;top: 0;left: 0;width: 0%;height: 100%;overflow: hidden;transition: width 200ms;}.pdfjs .loadingBar .progress .glimmer {position: absolute;top: 0;left: 0;height: 100%;width: calc(100% + 150px);background: #7bcf34;}.pdfjs .backTop {width: 50px;height: 50px;line-height: 50px;text-align: center;position: absolute;bottom: 90px;right: 15px;font-size: 18px;z-index: 999;border-radius: 50%;background: rgba(0, 0, 0, 0.4) url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsSAAALEgHS3X78AAAA+klEQVRYw+2WUQ2DMBCG2TIBSJiESkACEpCAg83BcLBJmIQ5gClgDpiDby9tciGkoaUtZOESXuhdv7+X/pdm2dYC6IgX7Zh3THy+w9oN/rMASqBcE26iSA1XwCAEDIBKBc8F/KE/gB7IU8BbDXyJf2Z2tFFFAE8N6iRIi/jotXssuGn1FzhPrCu9BtCEhlcCrix5hbiYVSh46bKpELvcniO71Q51zWJ7ju3mUe9vzym7eR7Az57CbohTXBzAt9GknG9PoLY8KK4z6htLfeXTTXMZAfoZuWYWKC+YZWMAQuWZSP0k2wXsAnYB2xNwci1wGTKhO/COlLtu/ABVfTFsxwwYRgAAAABJRU5ErkJggg==) no-repeat center;background-size: 50% 50%;transition: all .3s;display: none;}.pdfjs .loadEffect {width: 100px;height: 100px;position: absolute;top: 50%;left: 50%;margin-top: -50px;margin-left: -50px;z-index: 99;background: url(data:image/gif;base64,R0lGODlhgACAAKIAAP///93d3bu7u5mZmQAA/wAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFBQAEACwCAAIAfAB8AAAD/0i63P4wygYqmDjrzbtflvWNZGliYXiubKuloivPLlzReD7al+7/Eh5wSFQIi8hHYBkwHUmD6CD5YTJLz49USuVYraRsZ7vtar7XnQ1Kjpoz6LRHvGlz35O4nEPP2O94EnpNc2sef1OBGIOFMId/inB6jSmPdpGScR19EoiYmZobnBCIiZ95k6KGGp6ni4wvqxilrqBfqo6skLW2YBmjDa28r6Eosp27w8Rov8ekycqoqUHODrTRvXsQwArC2NLF29UM19/LtxO5yJd4Au4CK7DUNxPebG4e7+8n8iv2WmQ66BtoYpo/dvfacBjIkITBE9DGlMvAsOIIZjIUAixliv9ixYZVtLUos5GjwI8gzc3iCGghypQqrbFsme8lwZgLZtIcYfNmTJ34WPTUZw5oRxdD9w0z6iOpO15MgTh1BTTJUKos39jE+o/KS64IFVmsFfYT0aU7capdy7at27dw48qdS7eu3bt480I02vUbX2F/JxYNDImw4GiGE/P9qbhxVpWOI/eFKtlNZbWXuzlmG1mv58+gQ4seTbq06dOoU6vGQZJy0FNlMcV+czhQ7SQmYd8eMhPs5BxVdfcGEtV3buDBXQ+fURxx8oM6MT9P+Fh6dOrH2zavc13u9JXVJb520Vp8dvC76wXMuN5Sepm/1WtkEZHDefnzR9Qvsd9+/wi8+en3X0ntYVcSdAE+UN4zs7ln24CaLagghIxBaGF8kFGoIYV+Ybghh841GIyI5ICIFoklJsigihmimJOLEbLYIYwxSgigiZ+8l2KB+Ml4oo/w8dijjcrouCORKwIpnJIjMnkkksalNeR4fuBIm5UEYImhIlsGCeWNNJphpJdSTlkml1jWeOY6TnaRpppUctcmFW9mGSaZceYopH9zkjnjUe59iR5pdapWaGqHopboaYua1qije67GJ6CuJAAAIfkEBQUABAAsCgACAFcAMAAAA/9Iutz+ML5Ag7w46z0r5WAoSp43nihXVmnrdusrv+s332dt4Tyo9yOBUJD6oQBIQGs4RBlHySSKyczVTtHoidocPUNZaZAr9F5FYbGI3PWdQWn1mi36buLKFJvojsHjLnshdhl4L4IqbxqGh4gahBJ4eY1kiX6LgDN7fBmQEJI4jhieD4yhdJ2KkZk8oiSqEaatqBekDLKztBG2CqBACq4wJRi4PZu1sA2+v8C6EJexrBAD1AOBzsLE0g/V1UvYR9sN3eR6lTLi4+TlY1wz6Qzr8u1t6FkY8vNzZTxaGfn6mAkEGFDgL4LrDDJDyE4hEIbdHB6ESE1iD4oVLfLAqPETIsOODwmCDJlv5MSGJklaS6khAQAh+QQFBQAEACwfAAIAVwAwAAAD/0i63P5LSAGrvTjrNuf+YKh1nWieIumhbFupkivPBEzR+GnnfLj3ooFwwPqdAshAazhEGUXJJIrJ1MGOUamJ2jQ9QVltkCv0XqFh5IncBX01afGYnDqD40u2z76JK/N0bnxweC5sRB9vF34zh4gjg4uMjXobihWTlJUZlw9+fzSHlpGYhTminKSepqebF50NmTyor6qxrLO0L7YLn0ALuhCwCrJAjrUqkrjGrsIkGMW/BMEPJcphLgDaABjUKNEh29vdgTLLIOLpF80s5xrp8ORVONgi8PcZ8zlRJvf40tL8/QPYQ+BAgjgMxkPIQ6E6hgkdjoNIQ+JEijMsasNY0RQix4gKP+YIKXKkwJIFF6JMudFEAgAh+QQFBQAEACw8AAIAQgBCAAAD/kg0PPowykmrna3dzXvNmSeOFqiRaGoyaTuujitv8Gx/661HtSv8gt2jlwIChYtc0XjcEUnMpu4pikpv1I71astytkGh9wJGJk3QrXlcKa+VWjeSPZHP4Rtw+I2OW81DeBZ2fCB+UYCBfWRqiQp0CnqOj4J1jZOQkpOUIYx/m4oxg5cuAaYBO4Qop6c6pKusrDevIrG2rkwptrupXB67vKAbwMHCFcTFxhLIt8oUzLHOE9Cy0hHUrdbX2KjaENzey9Dh08jkz8Tnx83q66bt8PHy8/T19vf4+fr6AP3+/wADAjQmsKDBf6AOKjS4aaHDgZMeSgTQcKLDhBYPEswoA1BBAgAh+QQFBQAEACxOAAoAMABXAAAD7Ei6vPOjyUkrhdDqfXHm4OZ9YSmNpKmiqVqykbuysgvX5o2HcLxzup8oKLQQix0UcqhcVo5ORi+aHFEn02sDeuWqBGCBkbYLh5/NmnldxajX7LbPBK+PH7K6narfO/t+SIBwfINmUYaHf4lghYyOhlqJWgqDlAuAlwyBmpVnnaChoqOkpaanqKmqKgGtrq+wsbA1srW2ry63urasu764Jr/CAb3Du7nGt7TJsqvOz9DR0tPU1TIA2ACl2dyi3N/aneDf4uPklObj6OngWuzt7u/d8fLY9PXr9eFX+vv8+PnYlUsXiqC3c6PmUUgAACH5BAUFAAQALE4AHwAwAFcAAAPpSLrc/m7IAau9bU7MO9GgJ0ZgOI5leoqpumKt+1axPJO1dtO5vuM9yi8TlAyBvSMxqES2mo8cFFKb8kzWqzDL7Xq/4LB4TC6bz1yBes1uu9uzt3zOXtHv8xN+Dx/x/wJ6gHt2g3Rxhm9oi4yNjo+QkZKTCgGWAWaXmmOanZhgnp2goaJdpKGmp55cqqusrZuvsJays6mzn1m4uRAAvgAvuBW/v8GwvcTFxqfIycA3zA/OytCl0tPPO7HD2GLYvt7dYd/ZX99j5+Pi6tPh6+bvXuTuzujxXens9fr7YPn+7egRI9PPHrgpCQAAIfkEBQUABAAsPAA8AEIAQgAAA/lIutz+UI1Jq7026h2x/xUncmD5jehjrlnqSmz8vrE8u7V5z/m5/8CgcEgsGo/IpHLJbDqf0Kh0ShBYBdTXdZsdbb/Yrgb8FUfIYLMDTVYz2G13FV6Wz+lX+x0fdvPzdn9WeoJGAYcBN39EiIiKeEONjTt0kZKHQGyWl4mZdREAoQAcnJhBXBqioqSlT6qqG6WmTK+rsa1NtaGsuEu6o7yXubojsrTEIsa+yMm9SL8osp3PzM2cStDRykfZ2tfUtS/bRd3ewtzV5pLo4eLjQuUp70Hx8t9E9eqO5Oku5/ztdkxi90qPg3x2EMpR6IahGocPCxp8AGtigwQAIfkEBQUABAAsHwBOAFcAMAAAA/9Iutz+MMo36pg4682J/V0ojs1nXmSqSqe5vrDXunEdzq2ta3i+/5DeCUh0CGnF5BGULC4tTeUTFQVONYAs4CfoCkZPjFar83rBx8l4XDObSUL1Ott2d1U4yZwcs5/xSBB7dBMBhgEYfncrTBGDW4WHhomKUY+QEZKSE4qLRY8YmoeUfkmXoaKInJ2fgxmpqqulQKCvqRqsP7WooriVO7u8mhu5NacasMTFMMHCm8qzzM2RvdDRK9PUwxzLKdnaz9y/Kt8SyR3dIuXmtyHpHMcd5+jvWK4i8/TXHff47SLjQvQLkU+fG29rUhQ06IkEG4X/Rryp4mwUxSgLL/7IqFETB8eONT6ChCFy5ItqJomES6kgAQAh+QQFBQAEACwKAE4AVwAwAAAD/0i63A4QuEmrvTi3yLX/4MeNUmieITmibEuppCu3sDrfYG3jPKbHveDktxIaF8TOcZmMLI9NyBPanFKJp4A2IBx4B5lkdqvtfb8+HYpMxp3Pl1qLvXW/vWkli16/3dFxTi58ZRcChwIYf3hWBIRchoiHiotWj5AVkpIXi4xLjxiaiJR/T5ehoomcnZ+EGamqq6VGoK+pGqxCtaiiuJVBu7yaHrk4pxqwxMUzwcKbyrPMzZG90NGDrh/JH8t72dq3IN1jfCHb3L/e5ebh4ukmxyDn6O8g08jt7tf26ybz+m/W9GNXzUQ9fm1Q/APoSWAhhfkMAmpEbRhFKwsvCsmosRIHx444PoKcIXKkjIImjTzjkQAAIfkEBQUABAAsAgA8AEIAQgAAA/VIBNz+8KlJq72Yxs1d/uDVjVxogmQqnaylvkArT7A63/V47/m2/8CgcEgsGo/IpHLJbDqf0Kh0Sj0FroGqDMvVmrjgrDcTBo8v5fCZki6vCW33Oq4+0832O/at3+f7fICBdzsChgJGeoWHhkV0P4yMRG1BkYeOeECWl5hXQ5uNIAOjA1KgiKKko1CnqBmqqk+nIbCkTq20taVNs7m1vKAnurtLvb6wTMbHsUq4wrrFwSzDzcrLtknW16tI2tvERt6pv0fi48jh5h/U6Zs77EXSN/BE8jP09ZFA+PmhP/xvJgAMSGBgQINvEK5ReIZhQ3QEMTBLAAAh+QQFBQAEACwCAB8AMABXAAAD50i6DA4syklre87qTbHn4OaNYSmNqKmiqVqyrcvBsazRpH3jmC7yD98OCBF2iEXjBKmsAJsWHDQKmw571l8my+16v+CweEwum8+hgHrNbrvbtrd8znbR73MVfg838f8BeoB7doN0cYZvaIuMjY6PkJGSk2gClgJml5pjmp2YYJ6dX6GeXaShWaeoVqqlU62ir7CXqbOWrLafsrNctjIDwAMWvC7BwRWtNsbGFKc+y8fNsTrQ0dK3QtXAYtrCYd3eYN3c49/a5NVj5eLn5u3s6e7x8NDo9fbL+Mzy9/T5+tvUzdN3Zp+GBAAh+QQJBQAEACwCAAIAfAB8AAAD/0i63P4wykmrvTjrzbv/YCiOZGmeaKqubOu+cCzPdArcQK2TOL7/nl4PSMwIfcUk5YhUOh3M5nNKiOaoWCuWqt1Ou16l9RpOgsvEMdocXbOZ7nQ7DjzTaeq7zq6P5fszfIASAYUBIYKDDoaGIImKC4ySH3OQEJKYHZWWi5iZG0ecEZ6eHEOio6SfqCaqpaytrpOwJLKztCO2jLi1uoW8Ir6/wCHCxMG2x7muysukzb230M6H09bX2Nna29zd3t/g4cAC5OXm5+jn3Ons7eba7vHt2fL16tj2+QL0+vXw/e7WAUwnrqDBgwgTKlzIsKHDh2gGSBwAccHEixAvaqTYcFCjRoYeNyoM6REhyZIHT4o0qPIjy5YTTcKUmHImx5cwE85cmJPnSYckK66sSAAj0aNIkypdyrSp06dQo0qdSrWq1atYs2rdyrWr169gwxZJAAA7) no-repeat center;background-size: 30% 30%;transition: all .3s;}.pdfjs .pdfViewer .pageContainer img.pdfLogo {position: absolute;z-index: 101;}.pdfjs .pdfViewer .pageContainer canvas.pdfLogo {position: absolute;z-index: 101;}.pdfjs .textLayer {position: absolute;left: 0;top: 0;right: 0;bottom: 0;overflow: hidden;opacity: 0.2;line-height: 1.0;z-index: 101;user-select: text;}.pdfjs .textLayer>br::selection {background-color: transparent !important;}.pdfjs .textLayer>span {color: transparent;position: absolute;white-space: pre;cursor: text;transform-origin: 0% 0%;}.pdfjs .textLayer .highlight {margin: -1px;padding: 1px;background-color: rgba(180, 0, 170, 1);border-radius: 4px;}.pdfjs .textLayer .highlight.begin {border-radius: 4px 0px 0px 4px;}.pdfjs .textLayer .highlight.end {border-radius: 0px 4px 4px 0px;}.pdfjs .textLayer .highlight.middle {border-radius: 0px;}.pdfjs .textLayer .highlight.selected {background-color: rgba(0, 100, 0, 1);}.pdfjs .textLayer ::selection {background: rgba(0, 0, 255, 1);}.pdfjs .textLayer .endOfContent {display: block;position: absolute;left: 0px;top: 100%;right: 0px;bottom: 0px;z-index: -1;cursor: default;}.pdfjs .textLayer .endOfContent.active {top: 0px;}';
	if (typeof Object.assign != 'function') {
		Object.defineProperty(Object, "assign", {
			value: function assign(target, varArgs) {
				if (target == null) {
					throw new TypeError('Cannot convert undefined or null to object');
				}
				var to = Object(target);
				for (var index = 1; index < arguments.length; index++) {
					var nextSource = arguments[index];
					if (nextSource != null) {
						for (var nextKey in nextSource) {
							if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
								if (nextKey && nextSource[nextKey]) {
									to[nextKey] = nextSource[nextKey];
								}
							}
						}
					}
				}
				return to;
			},
			writable: true,
			configurable: true
		});
	}

	if (typeof Array.from != 'function') {
		Array.from = function (object) {
			return [].slice.call(object);
		};
	}

	// utils
	var buildElement = function (str) {
		// empty string as title argument required by IE and Edge
		var tmp = document.implementation.createHTMLDocument('');
		tmp.body.innerHTML = str;
		return Array.from(tmp.body.children)[0];
	};

	var triggerEvent = function (el, name) {
		var event = document.createEvent('HTMLEvents');
		event.initEvent(name, true, false);
		el.dispatchEvent(event);
	};
	var _createClass = function () {
		function defineProperties(target, props) {
			for (var i = 0; i < props.length; i++) {
				var descriptor = props[i];
				descriptor.enumerable = descriptor.enumerable || false;
				descriptor.configurable = true;
				if ("value" in descriptor) descriptor.writable = true;
				Object.defineProperty(target, descriptor.key, descriptor);
			}
		}
		return function (Constructor, protoProps, staticProps) {
			if (protoProps) defineProperties(Constructor.prototype, protoProps);
			if (staticProps) defineProperties(Constructor, staticProps);
			return Constructor;
		};
	}();

	function ImgResizeObserver() {
		this.callbacks = {};
		let _this = this;
		this.observerInstance = new ResizeObserver(function (entries) {
			for (let i = 0; i < entries.length; i++) {
				const event = entries[i];
				const id = event.target.getAttribute("data-o-key");
				const fn = _this.callbacks[id];
				fn && fn(event);
			}
		});
	}
	ImgResizeObserver.prototype.observer = function (el, id, handler) {
		this.observerInstance.observe(el);
		this.callbacks[id] = handler;
	};
	ImgResizeObserver.prototype.unobserve = function (el, id, handler) {
		this.observerInstance.unobserve(el);
		delete this.callbacks[id];
	};

	const imgObserver = new ImgResizeObserver();

	var _createClass = function () {
		function defineProperties(target, props) {
			for (var i = 0; i < props.length; i++) {
				var descriptor = props[i];
				descriptor.enumerable = descriptor.enumerable || false;
				descriptor.configurable = true;
				if ("value" in descriptor) descriptor.writable = true;
				Object.defineProperty(target, descriptor.key, descriptor);
			}
		}
		return function (Constructor, protoProps, staticProps) {
			if (protoProps) defineProperties(Constructor.prototype, protoProps);
			if (staticProps) defineProperties(Constructor, staticProps);
			return Constructor;
		};
	}();

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	var renderTextLayer = pdfjsLib.renderTextLayer;
	var EXPAND_DIVS_TIMEOUT = 300; // ms


	var TextLayerBuilder = function () {
		function TextLayerBuilder(_ref) {
			var textLayerDiv = _ref.textLayerDiv;
			var eventBus = _ref.eventBus;
			var pageIndex = _ref.pageIndex;
			var viewport = _ref.viewport;
			var _ref$findController = _ref.findController;
			var findController = _ref$findController === undefined ? null : _ref$findController;
			var _ref$enhanceTextSelec = _ref.enhanceTextSelection;
			var enhanceTextSelection = _ref$enhanceTextSelec === undefined ? false : _ref$enhanceTextSelec;

			_classCallCheck(this, TextLayerBuilder);

			this.textLayerDiv = textLayerDiv;
			this.eventBus = eventBus;
			this.textContent = null;
			this.textContentItemsStr = [];
			this.textContentStream = null;
			this.renderingDone = false;
			this.pageIdx = pageIndex;
			this.pageNumber = this.pageIdx + 1;
			this.matches = [];
			this.viewport = viewport;
			this.textDivs = [];
			this.findController = findController;
			this.textLayerRenderTask = null;
			this.enhanceTextSelection = enhanceTextSelection;

			this._onUpdateTextLayerMatches = null;
			this._bindMouse();
		}

		/**
		 * @private
		 */


		_createClass(TextLayerBuilder, [{
			key: "_finishRendering",
			value: function _finishRendering() {
				this.renderingDone = true;

				if (!this.enhanceTextSelection) {
					var endOfContent = document.createElement("div");
					endOfContent.className = "endOfContent";
					this.textLayerDiv.appendChild(endOfContent);
				}
				if (this.eventBus) {
					this.eventBus.dispatch("textlayerrendered", {
						source: this,
						pageNumber: this.pageNumber,
						numTextDivs: this.textDivs.length
					});
				}
			}

			/**
			 * Renders the text layer.
			 *
			 * @param {number} [timeout] - Wait for a specified amount of milliseconds
			 *                             before rendering.
			 */

		}, {
			key: "render",
			value: function render() {
				var _this = this;

				var timeout = arguments.length <= 0 || arguments[0] === undefined ? 0 :
					arguments[0];

				if (!(this.textContent || this.textContentStream) || this.renderingDone) {
					return;
				}
				this.cancel();

				this.textDivs = [];
				var textLayerFrag = document.createDocumentFragment();
				this.textLayerRenderTask = renderTextLayer({
					textContent: this.textContent,
					textContentStream: this.textContentStream,
					container: textLayerFrag,
					viewport: this.viewport,
					textDivs: this.textDivs,
					textContentItemsStr: this.textContentItemsStr,
					timeout: timeout,
					enhanceTextSelection: this.enhanceTextSelection
				});
				this.textLayerRenderTask.promise.then(function () {
					_this.textLayerDiv.appendChild(textLayerFrag);
					_this._finishRendering();
					_this._updateMatches();
				}, function (reason) {
					// Cancelled or failed to render text layer; skipping errors.
				});

				if (!this._onUpdateTextLayerMatches) {
					this._onUpdateTextLayerMatches = function (evt) {
						if (evt.pageIndex === _this.pageIdx || evt.pageIndex === -1) {
							_this._updateMatches();
						}
					};
					if (this.eventBus) {
						this.eventBus._on("updatetextlayermatches", this
							._onUpdateTextLayerMatches);
					}
				}
			}

			/**
			 * Cancel rendering of the text layer.
			 */

		}, {
			key: "cancel",
			value: function cancel() {
				if (this.textLayerRenderTask) {
					this.textLayerRenderTask.cancel();
					this.textLayerRenderTask = null;
				}
				if (this._onUpdateTextLayerMatches) {
					this.eventBus._off("updatetextlayermatches", this
						._onUpdateTextLayerMatches);
					this._onUpdateTextLayerMatches = null;
				}
			}
		}, {
			key: "setTextContentStream",
			value: function setTextContentStream(readableStream) {
				this.cancel();
				this.textContentStream = readableStream;
			}
		}, {
			key: "setTextContent",
			value: function setTextContent(textContent) {
				this.cancel();
				this.textContent = textContent;
			}
		}, {
			key: "_convertMatches",
			value: function _convertMatches(matches, matchesLength) {
				// Early exit if there is nothing to convert.
				if (!matches) {
					return [];
				}
				var findController = this.findController;
				var textContentItemsStr = this.textContentItemsStr;


				var i = 0,
					iIndex = 0;
				var end = textContentItemsStr.length - 1;
				var queryLen = findController.state.query.length;
				var result = [];

				for (var m = 0, mm = matches.length; m < mm; m++) {
					// Calculate the start position.
					var matchIdx = matches[m];

					// Loop over the divIdxs.
					while (i !== end && matchIdx >= iIndex + textContentItemsStr[i].length) {
						iIndex += textContentItemsStr[i].length;
						i++;
					}

					if (i === textContentItemsStr.length) {
						console.error("Could not find a matching mapping");
					}

					var match = {
						begin: {
							divIdx: i,
							offset: matchIdx - iIndex
						}
					};

					// Calculate the end position.
					if (matchesLength) {
						// Multiterm search.
						matchIdx += matchesLength[m];
					} else {
						// Phrase search.
						matchIdx += queryLen;
					}

					// Somewhat the same array as above, but use > instead of >= to get
					// the end position right.
					while (i !== end && matchIdx > iIndex + textContentItemsStr[i].length) {
						iIndex += textContentItemsStr[i].length;
						i++;
					}

					match.end = {
						divIdx: i,
						offset: matchIdx - iIndex
					};
					result.push(match);
				}
				return result;
			}
		}, {
			key: "_renderMatches",
			value: function _renderMatches(matches) {
				// Early exit if there is nothing to render.
				if (matches.length === 0) {
					return;
				}
				var findController = this.findController;
				var pageIdx = this.pageIdx;
				var textContentItemsStr = this.textContentItemsStr;
				var textDivs = this.textDivs;


				var isSelectedPage = pageIdx === findController.selected.pageIdx;
				var selectedMatchIdx = findController.selected.matchIdx;
				var highlightAll = findController.state.highlightAll;
				var prevEnd = null;
				var infinity = {
					divIdx: -1,
					offset: undefined
				};

				function beginText(begin, className) {
					var divIdx = begin.divIdx;
					textDivs[divIdx].textContent = "";
					appendTextToDiv(divIdx, 0, begin.offset, className);
				}

				function appendTextToDiv(divIdx, fromOffset, toOffset, className) {
					var div = textDivs[divIdx];
					var content = textContentItemsStr[divIdx].substring(fromOffset, toOffset);
					var node = document.createTextNode(content);
					if (className) {
						var span = document.createElement("span");
						span.className = className;
						span.appendChild(node);
						div.appendChild(span);
						return;
					}
					div.appendChild(node);
				}

				var i0 = selectedMatchIdx,
					i1 = i0 + 1;
				if (highlightAll) {
					i0 = 0;
					i1 = matches.length;
				} else if (!isSelectedPage) {
					// Not highlighting all and this isn't the selected page, so do nothing.
					return;
				}

				for (var i = i0; i < i1; i++) {
					var match = matches[i];
					var begin = match.begin;
					var end = match.end;
					var isSelected = isSelectedPage && i === selectedMatchIdx;
					var highlightSuffix = isSelected ? " selected" : "";

					if (isSelected) {
						// Attempt to scroll the selected match into view.
						findController.scrollMatchIntoView({
							element: textDivs[begin.divIdx],
							pageIndex: pageIdx,
							matchIndex: selectedMatchIdx
						});
					}

					// Match inside new div.
					if (!prevEnd || begin.divIdx !== prevEnd.divIdx) {
						// If there was a previous div, then add the text at the end.
						if (prevEnd !== null) {
							appendTextToDiv(prevEnd.divIdx, prevEnd.offset, infinity.offset);
						}
						// Clear the divs and set the content until the starting point.
						beginText(begin);
					} else {
						appendTextToDiv(prevEnd.divIdx, prevEnd.offset, begin.offset);
					}

					if (begin.divIdx === end.divIdx) {
						appendTextToDiv(begin.divIdx, begin.offset, end.offset, "highlight" +
							highlightSuffix);
					} else {
						appendTextToDiv(begin.divIdx, begin.offset, infinity.offset,
							"highlight begin" + highlightSuffix);
						for (var n0 = begin.divIdx + 1, n1 = end.divIdx; n0 < n1; n0++) {
							textDivs[n0].className = "highlight middle" + highlightSuffix;
						}
						beginText(end, "highlight end" + highlightSuffix);
					}
					prevEnd = end;
				}

				if (prevEnd) {
					appendTextToDiv(prevEnd.divIdx, prevEnd.offset, infinity.offset);
				}
			}
		}, {
			key: "_updateMatches",
			value: function _updateMatches() {
				// Only show matches when all rendering is done.
				if (!this.renderingDone) {
					return;
				}
				var findController = this.findController;
				var matches = this.matches;
				var pageIdx = this.pageIdx;
				var textContentItemsStr = this.textContentItemsStr;
				var textDivs = this.textDivs;

				var clearedUntilDivIdx = -1;

				// Clear all current matches.
				for (var i = 0, ii = matches.length; i < ii; i++) {
					var match = matches[i];
					var begin = Math.max(clearedUntilDivIdx, match.begin.divIdx);
					for (var n = begin, end = match.end.divIdx; n <= end; n++) {
						var div = textDivs[n];
						div.textContent = textContentItemsStr[n];
						div.className = "";
					}
					clearedUntilDivIdx = match.end.divIdx + 1;
				}

				if (!findController || !findController.highlightMatches) {
					return;
				}
				// Convert the matches on the `findController` into the match format
				// used for the textLayer.
				var pageMatches = findController.pageMatches[pageIdx] || null;
				var pageMatchesLength = findController.pageMatchesLength[pageIdx] || null;

				this.matches = this._convertMatches(pageMatches, pageMatchesLength);
				this._renderMatches(this.matches);
			}

			/**
			 * Improves text selection by adding an additional div where the mouse was
			 * clicked. This reduces flickering of the content if the mouse is slowly
			 * dragged up or down.
			 *
			 * @private
			 */

		}, {
			key: "_bindMouse",
			value: function _bindMouse() {
				var _this2 = this;

				var div = this.textLayerDiv;
				var expandDivsTimer = null;

				div.addEventListener("mousedown", function (evt) {
					if (_this2.enhanceTextSelection && _this2.textLayerRenderTask) {
						_this2.textLayerRenderTask.expandTextDivs(true);
						if ((typeof PDFJSDev === "undefined" || !PDFJSDev.test(
							"MOZCENTRAL")) && expandDivsTimer) {
							clearTimeout(expandDivsTimer);
							expandDivsTimer = null;
						}
						return;
					}

					var end = div.querySelector(".endOfContent");
					if (!end) {
						return;
					}
					if (typeof PDFJSDev === "undefined" || !PDFJSDev.test(
						"MOZCENTRAL")) {
						// On non-Firefox browsers, the selection will feel better if the height
						// of the `endOfContent` div is adjusted to start at mouse click
						// location. This avoids flickering when the selection moves up.
						// However it does not work when selection is started on empty space.
						var adjustTop = evt.target !== div;
						if (typeof PDFJSDev === "undefined" || PDFJSDev.test(
							"GENERIC")) {
							adjustTop = adjustTop && window.getComputedStyle(end)
								.getPropertyValue("-moz-user-select") !== "none";
						}
						if (adjustTop) {
							var divBounds = div.getBoundingClientRect();
							var r = Math.max(0, (evt.pageY - divBounds.top) / divBounds
								.height);
							end.style.top = (r * 100).toFixed(2) + "%";
						}
					}
					end.classList.add("active");
				});

				div.addEventListener("mouseup", function () {
					if (_this2.enhanceTextSelection && _this2.textLayerRenderTask) {
						if (typeof PDFJSDev === "undefined" || !PDFJSDev.test(
							"MOZCENTRAL")) {
							expandDivsTimer = setTimeout(function () {
								if (_this2.textLayerRenderTask) {
									_this2.textLayerRenderTask.expandTextDivs(
										false);
								}
								expandDivsTimer = null;
							}, EXPAND_DIVS_TIMEOUT);
						} else {
							_this2.textLayerRenderTask.expandTextDivs(false);
						}
						return;
					}

					var end = div.querySelector(".endOfContent");
					if (!end) {
						return;
					}
					if (typeof PDFJSDev === "undefined" || !PDFJSDev.test(
						"MOZCENTRAL")) {
						end.style.top = "";
					}
					end.classList.remove("active");
				});
			}
		}]);

		return TextLayerBuilder;
	}();

	/**
	 * @implements IPDFTextLayerFactory
	 */


	var DefaultTextLayerFactory = function () {
		function DefaultTextLayerFactory() {
			_classCallCheck(this, DefaultTextLayerFactory);
		}

		_createClass(DefaultTextLayerFactory, [{
			key: "createTextLayerBuilder",

			/**
			 * @param {HTMLDivElement} textLayerDiv
			 * @param {number} pageIndex
			 * @param {PageViewport} viewport
			 * @param {boolean} enhanceTextSelection
			 * @param {EventBus} eventBus
			 * @returns {TextLayerBuilder}
			 */
			value: function createTextLayerBuilder(textLayerDiv, pageIndex, viewport) {
				var enhanceTextSelection = arguments.length <= 3 || arguments[3] === undefined ?
					false : arguments[3];
				var eventBus = arguments[4];

				return new TextLayerBuilder({
					textLayerDiv: textLayerDiv,
					pageIndex: pageIndex,
					viewport: viewport,
					enhanceTextSelection: enhanceTextSelection,
					eventBus: eventBus
				});
			}
		}]);

		return DefaultTextLayerFactory;
	}();

	g.TextLayerBuilder = TextLayerBuilder;
	g.DefaultTextLayerFactory = DefaultTextLayerFactory;

	var definePinchZoom = function () {
		var PinchZoom = function (el, options, pinchParentNode) {
			this.el = el;
			this.pinchParentNode = pinchParentNode;
			this.zoomFactor = 1;
			this.lastScale = 1;
			this.offset = {
				x: 0,
				y: 0
			};
			this.options = Object.assign({}, this.defaults, options);
			this.options.tapZoomFactor = isNaN(options.tapZoomFactor) ? 2 : options.tapZoomFactor;
			this.options.zoomOutFactor = isNaN(options.zoomOutFactor) ? 1.2 : options.zoomOutFactor;
			this.options.animationDuration = isNaN(options.animationDuration) ? 300 : options
				.animationDuration;
			this.options.maxZoom = isNaN(options.maxZoom) ? 3 : options.maxZoom;
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
				draggableUnzoomed: true,
				lockDragAxis: false,
				use2d: true,
				zoomStartEventName: 'pz_zoomstart',
				zoomEndEventName: 'pz_zoomend',
				dragStartEventName: 'pz_dragstart',
				dragEndEventName: 'pz_dragend',
				doubleTapEventName: 'pz_doubletap'
			},
			handleDragStart: function (event) {
				triggerEvent(this.el, this.options.dragStartEventName);
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
				triggerEvent(this.el, this.options.dragEndEventName);
				this.end();
			},
			handleZoomStart: function (event) {
				triggerEvent(this.el, this.options.zoomStartEventName);
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
				triggerEvent(this.el, this.options.zoomEndEventName);
				this.end();
			},
			handleDoubleTap: function (event) {
				var center = this.getTouches(event)[0],
					zoomFactor = this.zoomFactor > 1 ? 1 : this.options.tapZoomFactor,
					startZoomFactor = this.zoomFactor,
					updateProgress = (function (progress) {
						this.scaleTo(startZoomFactor + progress * (zoomFactor - startZoomFactor),
							center);
					}).bind(this);

				if (this.hasInteraction) {
					return;
				}
				if (startZoomFactor > zoomFactor) {
					center = this.getCurrentZoomCenter();
				}

				this.animate(this.options.animationDuration, updateProgress, this.swing);
				triggerEvent(this.el, this.options.doubleTapEventName);
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
				this.done && this.done.call(this, this.getInitialZoomFactor() * this.zoomFactor);
			},
			scaleZoomFactor: function (scale) {
				var originalZoomFactor = this.zoomFactor;
				this.zoomFactor *= scale;
				this.zoomFactor = Math.min(this.options.maxZoom, Math.max(this.zoomFactor, this.options
					.minZoom));
				return this.zoomFactor / originalZoomFactor;
			},
			canDrag: function () {
				return this.options.draggableUnzoomed || !isCloseTo(this.zoomFactor, 1);
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
						this.scaleTo(startZoomFactor + progress * (zoomFactor - startZoomFactor),
							center);
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
				if (this.pinchContainer && this.el) {
					return this.pinchContainer.offsetWidth / this.el.offsetWidth;
				} else {
					return 0;
				}
			},
			getAspectRatio: function () {
				if (this.el) {
					return this.pinchContainer.offsetWidth / this.el.offsetHeight;
				} else {
					return 0;
				}

			},
			getCurrentZoomCenter: function () {
				var length = this.pinchContainer.offsetWidth * this.zoomFactor,
					offsetLeft = this.offset.x,
					offsetRight = length - offsetLeft - this.pinchContainer.offsetWidth,
					widthOffsetRatio = offsetLeft / offsetRight,
					centerX = widthOffsetRatio * this.pinchContainer.offsetWidth / (widthOffsetRatio + 1),

					height = this.pinchContainer.offsetHeight * this.zoomFactor,
					offsetTop = this.offset.y,
					offsetBottom = height - offsetTop - this.pinchContainer.offsetHeight,
					heightOffsetRatio = offsetTop / offsetBottom,
					centerY = heightOffsetRatio * this.pinchContainer.offsetHeight / (heightOffsetRatio +
						1);

				if (offsetRight === 0) {
					centerX = this.pinchContainer.offsetWidth;
				}
				if (offsetBottom === 0) {
					centerY = this.pinchContainer.offsetHeight;
				}

				return {
					x: centerX,
					y: centerY
				};
			},

			getTouches: function (event) {
				var position = this.pinchContainer.getBoundingClientRect();
				// var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
				// var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
				// var scrollTop2 = this.pinchParentNode.scrollTop;
				// var scrollLeft2 = this.pinchParentNode.scrollLeft;
				var posTop = position.top;
				var posLeft = position.left;

				return Array.prototype.slice.call(event.touches).map(function (touch) {
					return {
						x: touch.pageX - posLeft,
						y: touch.pageY - posTop,
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
				if (this.el) {
					return this.el.offsetWidth;
				} else {
					return 0;
				}
			},

			getContainerY: function () {
				return this.el.offsetHeight;
			},
			setContainerY: function (y) {
				y = y.toFixed(2);
				return this.pinchContainer.style.height = y + 'px';
			},
			setupMarkup: function () {
				this.pinchContainer = buildElement('<div class="pinch-zoom-container"></div>');
				this.el.parentNode.insertBefore(this.pinchContainer, this.el);
				this.pinchContainer.appendChild(this.el);

				this.pinchContainer.style.position = 'relative';

				this.el.style.webkitTransformOrigin = '0% 0%';
				this.el.style.mozTransformOrigin = '0% 0%';
				this.el.style.msTransformOrigin = '0% 0%';
				this.el.style.oTransformOrigin = '0% 0%';
				this.el.style.transformOrigin = '0% 0%';

				this.el.style.position = 'relative';
			},

			end: function () {
				this.hasInteraction = false;
				this.sanitize();
				this.update();

			},
			bindEvents: function () {
				var self = this;
				detectGestures(this.pinchParentNode, this);

				this.resizeHandler = this.update.bind(this);
				window.addEventListener('resize', this.resizeHandler);
				Array.from(this.el.querySelectorAll('canvas')).forEach(function (imgEl) {
					self.update.bind(self)
					// imgEl.addEventListener('load', self.update.bind(self));
				});
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
						this.el.style.webkitTransform = transform3d;
						this.el.style.mozTransform = transform2d;
						this.el.style.msTransform = transform2d;
						this.el.style.oTransform = transform2d;
						this.el.style.transform = transform3d;
					} else {
						this.el.style.webkitTransform = transform2d;
						this.el.style.mozTransform = transform2d;
						this.el.style.msTransform = transform2d;
						this.el.style.oTransform = transform2d;
						this.el.style.transform = transform2d;
						this.is3d = false;
					}
				}).bind(this), 0);
			},
			enable: function () {
				this.enabled = true;
			},
			disable: function () {
				this.enabled = false;
			},
			destroy: function () {
				window.removeEventListener('resize', this.resizeHandler);
				if (this.pinchContainer) {
					var parentNode = this.pinchContainer.parentNode;
					var childNode = this.pinchContainer.firstChild;
					parentNode.appendChild(childNode);
					parentNode.removeChild(this.pinchContainer);

				}
			}
		};

		var detectGestures = function (el, target) {
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
					var top = el.scrollTop || 0;
					if (fingers > 1) {
						lastTouchStart = null;
						lastTouchY = null;
						cancelEvent(event);
					}

					if (time - lastTouchStart < 300 && Math.abs(pageY - lastTouchY) < 10 && Math.abs(
						lastTop - top) < 10) {
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

			el.addEventListener('touchstart', function (event) {
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

			el.addEventListener('touchmove', function (event) {
				if (target.enabled) {
					lastclientY = event.changedTouches[0].clientY;
					if (firstMove) {
						updateInteraction(event);
						startTouches = targetTouches(event.touches);
					} else {
						switch (interaction) {
							case 'zoom':
								target.handleZoom(event, calculateScale(startTouches,
									targetTouches(event.touches)));
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

			el.addEventListener('touchend', function (event) {
				if (target.enabled) {
					fingers = event.touches.length;
					if (fingers > 1) {
						cancelEvent(event);
					}
					updateInteraction(event);
				}
			});

		};
		return PinchZoom;
	};
	var PinchZoom = definePinchZoom();
	var Pdfh5 = function (dom, options) {
		this.version = version;
		this.container = dom;
		this.options = options;
		this.thePDF = null;
		this.totalNum = null;
		this.pages = null;
		this.initTime = 0;
		this.scale = 1.5;
		this.currentNum = 1;
		this.loadedCount = 0;
		this.endTime = 0;
		this.pinchZoom = null;
		this.timer = null;
		this.docWidth = document.documentElement.clientWidth;
		this.cache = {};
		this.eventType = {};
		this.cacheNum = 1;
		this.resizeEvent = false;
		this.cacheData = null;
		this.pdfjsLibPromise = null;
		this.init(options);
	};

	Pdfh5.prototype = {
		init: function (options) {
			var self = this;
			if (this.container.pdfLoaded) {
				this.destroy();
			}
			var $style = document.createElement('style');
			$style.type = 'text/css';
			$style.textContent = css;
			document.head.appendChild($style);
			// pdfjsLib.cMapPacked = true;
			// pdfjsLib.rangeChunkSize = 65536;
			this.container.pdfLoaded = false;
			this.container.classList.add("pdfjs");
			this.initTime = new Date().getTime();
			setTimeout(function () {
				var arr1 = self.eventType["init"];
				if (arr1 && arr1 instanceof Array) {
					for (var i = 0; i < arr1.length; i++) {
						arr1[i] && arr1[i].call(self, self.initTime);
					}
				}
			}, 0);
			this.options = this.options ? this.options : {};
			this.options.pdfurl = this.options.pdfurl ? this.options.pdfurl : null;
			this.options.data = this.options.data ? this.options.data : null;
			this.options.scale = this.options.scale ? this.options.scale : this.scale;
			this.options.zoomEnable = this.options.zoomEnable === false ? false : true;
			this.options.scrollEnable = this.options.scrollEnable === false ? false : true;
			this.options.loadingBar = this.options.loadingBar === false ? false : true;
			this.options.pageNum = this.options.pageNum === false ? false : true;
			this.options.backTop = this.options.backTop === false ? false : true;
			this.options.URIenable = this.options.URIenable === true ? true : false;
			this.options.fullscreen = this.options.fullscreen === false ? false : true;
			this.options.renderType = this.options.renderType === "svg" ? "svg" : "canvas";
			this.options.resize = this.options.resize === false ? false : true;
			this.options.textLayer = this.options.textLayer === true ? true : false;
			this.options.goto = isNaN(this.options.goto) ? 0 : this.options.goto;
			if (this.options.logo && Object.prototype.toString.call(this.options.logo) === '[object Object]' && this.options.logo.src) {
				this.options.logo.img = new Image();
				this.options.logo.img.src = this.options.logo.src;
				this.options.logo.img.style.display = "none";
				document.body.appendChild(this.options.logo.img);
			} else {
				this.options.logo = false;
			}
			if (!(this.options.background && (this.options.background.color || this.options.background.image))) {
				this.options.background = false;
			}
			if (this.options.limit) {
				var n = parseFloat(this.options.limit);
				this.options.limit = isNaN(n) ? 0 : n < 0 ? 0 : n;
			} else {
				this.options.limit = 0;
			}
			this.options.type = this.options.type === "fetch" ? "fetch" : "ajax";

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
				'<div class="loadEffect loading"></div>';
			this.container.innerHTML = html;
			var viewer = document.createElement("div");
			viewer.className = 'pdfViewer';
			var viewerContainer = document.createElement("div");
			viewerContainer.className = 'viewerContainer';
			viewerContainer.appendChild(viewer);
			this.container.appendChild(viewerContainer);
			this.viewer = viewer;
			this.viewerContainer = viewerContainer;

			this.pageNum = this.container.querySelector('.pageNum');
			this.pageNow = this.pageNum.querySelector('.pageNow');
			this.pageTotal = this.pageNum.querySelector('.pageTotal');
			this.loadingBar = this.container.querySelector('.loadingBar');
			this.progress = this.loadingBar.querySelector('.progress');
			this.backTop = this.container.querySelector('.backTop');
			this.loading = this.container.querySelector('.loading');
			if (!this.options.loadingBar) {
				this.loadingBar.style.display = "none";
			}
			var containerH = this.container.offsetHeight,
				height = containerH * (1 / 3);

			if (!this.options.scrollEnable) {
				this.viewerContainer.style.overflow = "hidden";
			} else {
				this.viewerContainer.style.overflow = "auto";
			}
			viewerContainer.addEventListener('scroll', function () {
				var scrollTop = viewerContainer.scrollTop;
				if (scrollTop >= 150) {
					if (self.options.backTop) {
						self.backTop.style.display = "block";
					}
				} else {
					if (self.options.backTop) {
						// self.backTop.fadeOut(200);
						self.backTop.style.display = "none";
					}
				}
				if (self.viewerContainer) {
					self.pages = self.viewerContainer.querySelectorAll('.pageContainer');
				}
				clearTimeout(self.timer);
				if (self.options.pageNum && self.pageNum) {
					self.pageNum.style.display = "block";
				}
				var h = containerH;
				if (self.pages) {
					self.pages.forEach(function (obj, index) {
						var rect = obj.getBoundingClientRect();
						var top = rect.top;
						var bottom = rect.bottom;
						if (top <= height && bottom > height) {
							if (self.options.pageNum) {
								self.pageNow.innerText = index + 1;
							}
							self.currentNum = index + 1;
						}
						if (top <= h && bottom > h) {
							self.cacheNum = index + 1;
						}
					});
				}
				if (scrollTop + self.container.offsetHeight >= self.viewer.offsetHeight) {
					self.pageNow.innerText = self.totalNum;
				}
				if (scrollTop === 0) {
					self.pageNow.innerText = 1;
				}
				self.timer = setTimeout(function () {
					if (self.options.pageNum && self.pageNum) {
						// self.pageNum.fadeOut(200);
						self.pageNum.style.display = "none";
					}
				}, 1500);
				var arr1 = self.eventType["scroll"];
				if (arr1 && arr1 instanceof Array) {
					for (var i = 0; i < arr1.length; i++) {
						arr1[i] && arr1[i].call(self, scrollTop, self.currentNum);
					}
				}
			});

			this.fn1 = function () {
				var mart = self.viewer.style.transform;
				var arr = mart.replace(/[a-z\(\)\s]/g, '').split(',');
				var s1 = arr[0];
				var s2 = arr[3];
				var x = arr[4] / 2;
				var left = self.viewer.getBoundingClientRect().left;
				if (left <= -self.docWidth * 2) {
					x = -self.docWidth / 2;
				}
				self.viewer.style.transform = 'scale(' + s1 + ', ' + s2 + ') translate(' + x + 'px, 0px)';

				if (self.pinchZoom) {
					self.pinchZoom.offset.y = 0;
					self.pinchZoom.lastclientY = 0;
				}
				self.viewerContainer.scrollTo({
					top: 0,
					behavior: "smooth"
				});
				var arr1 = self.eventType["backTop"];
				if (arr1 && arr1 instanceof Array) {
					for (var i = 0; i < arr1.length; i++) {
						arr1[i] && arr1[i].call(self);
					}
				}
			};

			this.fn2 = function () {
				if (self.viewerContainer) {
					self.pages = self.viewerContainer.querySelectorAll('.pageContainer');
				}
				if (self.pages) {
					self.pages.forEach(function (item, i) {
						item.style.minHeight = "auto";
					});
				}
			};
			this.backTop.addEventListener("click", this.fn1);
			this.backTop.addEventListener("tap", this.fn1);

			function GetQueryString(name) {
				var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
				var r = g.location.search.substr(1).match(reg);
				if (r != null) return decodeURIComponent(r[2]);
				return "";
			}
			var pdfurl = GetQueryString("file"),
				url = "";
			if (pdfurl && self.options.URIenable) {
				url = pdfurl;
			} else if (self.options.pdfurl) {
				url = self.options.pdfurl;
			}
			if (self.options.loadingBar) {
				self.loadingBar.style.display = "block";
				self.progress.style.width = "3%";
			}

			if (url) {
				if (self.options.type === "ajax") {
					var xhr = new XMLHttpRequest();
					xhr.open("GET", url, true);
					xhr.responseType = self.options.responseType ? self.options.responseType : "blob";// blob arraybuffer
					xhr.onload = function (oEvent) {
						if (xhr.status === 200) {
							if (xhr.responseType === "arraybuffer") {
								var data = this.response;
								self.cacheData = data;
								self.renderPdf(self.options, { data: data });
							} else {
								var blob = this.response;
								var reader = new FileReader();
								reader.readAsDataURL(blob);
								reader.onload = function (e) {
									self.cacheData = e.target.result;
									self.renderPdf(self.options, { url: e.target.result });
								};
							}
						}
					};
					xhr.onerror = function (err) {
						self.loading.style.display = "none";
						var time = new Date().getTime();
						self.endTime = time - self.initTime;
						var arr1 = self.eventType["complete"];
						if (arr1 && arr1 instanceof Array) {
							for (var i = 0; i < arr1.length; i++) {
								arr1[i] && arr1[i].call(self, "error", err.statusText, self.endTime);
							}
						}
						var arr2 = self.eventType["error"];
						if (arr2 && arr2 instanceof Array) {
							for (var i = 0; i < arr2.length; i++) {
								arr2[i] && arr2[i].call(self, err.statusText, self.endTime);
							}
						}
					};
					xhr.send();
				} else {
					self.renderPdf(self.options, { url: url });
				}
			} else if (self.options.data) {
				var data = self.options.data;
				if (typeof data === "string" && data != "") {
					var rawLength = data.length;
					var array = [];
					for (i = 0; i < rawLength; i++) {
						array.push(data.charCodeAt(i) & 0xff);
					}
					self.cacheData = array;
					self.renderPdf(self.options, { data: array });
				} else if (typeof data === "object") {
					if (data.length == 0) {
						var time = new Date().getTime();
						self.endTime = time - self.initTime;
						var arr1 = self.eventType["complete"];
						if (arr1 && arr1 instanceof Array) {
							for (var i = 0; i < arr1.length; i++) {
								arr1[i] && arr1[i].call(self, "error", "options.data is empty Array", self.endTime);
							}
						}
						var arr2 = self.eventType["error"];
						if (arr2 && arr2 instanceof Array) {
							for (var i = 0; i < arr2.length; i++) {
								arr2[i] && arr2[i].call(self, "options.data is empty Array", self.endTime);
							}
						}
						console.log("options.data is invaild");
					} else {
						self.cacheData = data;
						self.renderPdf(self.options, { data: data });
					}
				}

			} else {
				var time = new Date().getTime();
				self.endTime = time - self.initTime;
				var arr1 = self.eventType["complete"];
				if (arr1 && arr1 instanceof Array) {
					for (var i = 0; i < arr1.length; i++) {
						arr1[i] && arr1[i].call(self, "error", "Expect options.pdfurl or options.data!", self.endTime);
					}
				}
				var arr2 = self.eventType["error"];
				if (arr2 && arr2 instanceof Array) {
					for (var i = 0; i < arr2.length; i++) {
						arr2[i] && arr2[i].call(self, "Expect options.pdfurl or options.data!", self.endTime);
					}
				}
				console.log("Expect options.pdfurl or options.data!");
			}
		},
		renderPdf: function (options, obj) {
			this.container.pdfLoaded = true;
			var self = this;
			if (options.cMapUrl) {
				obj.cMapUrl = options.cMapUrl;
			} else {
				obj.cMapUrl = 'https://unpkg.com/browse/pdfjs-dist@4.0.379/cmaps/';
			}
			if (options.httpHeaders) {
				obj.httpHeaders = options.httpHeaders;
			}
			if (options.withCredentials) {
				obj.withCredentials = true;
			}
			if (options.password) {
				obj.password = options.password;
			}
			if (options.stopAtErrors) {
				obj.stopAtErrors = true;
			}
			if (options.disableFontFace) {
				obj.disableFontFace = true;
			}
			if (options.disableRange) {
				obj.disableRange = true;
			}
			if (options.disableStream) {
				obj.disableStream = true;
			}
			if (options.disableAutoFetch) {
				obj.disableAutoFetch = true;
			}
			obj.cMapPacked = true;
			obj.rangeChunkSize = 65536;
			this.pdfjsLibPromise = pdfjsLib.getDocument(obj).promise.then(function (pdf) {
				self.loading.style.display = "none";
				self.thePDF = pdf;
				self.totalNum = pdf.numPages;
				if (options.limit > 0) {
					self.totalNum = options.limit;
				}
				self.pageTotal.innerText = self.totalNum;
				if (!self.pinchZoom) {
					var arr1 = self.eventType["ready"];
					if (arr1 && arr1 instanceof Array) {
						for (var i = 0; i < arr1.length; i++) {
							arr1[i] && arr1[i].call(self, self.totalNum);
						}
					}
					self.pinchZoom = new PinchZoom(self.viewer, {
						tapZoomFactor: options.tapZoomFactor,
						zoomOutFactor: options.zoomOutFactor,
						animationDuration: options.animationDuration,
						maxZoom: options.maxZoom,
						minZoom: options.minZoom
					}, self.viewerContainer);
					var timeout, firstZoom = true;
					self.pinchZoom.done = function (scale) {
						clearTimeout(timeout);
						timeout = setTimeout(function () {
							if (self.options.renderType === "svg") {
								return;
							}
							if (scale <= 1 || self.options.scale == 5) {
								return;
							}
							if (self.thePDF) {
								self.thePDF.destroy();
								self.thePDF = null;
							}
							self.options.scale = scale;
							self.renderPdf(self.options, { data: self.cacheData });
						}, 310);
						if (scale == 1) {
							if (self.viewerContainer) {
								self.viewerContainer.style.webkitOverflowScrolling = "touch";
							}
						} else {
							if (self.viewerContainer) {
								self.viewerContainer.style.webkitOverflowScrolling = "auto";
							}
						}
						var arr1 = self.eventType["zoom"];
						if (arr1 && arr1 instanceof Array) {
							for (var i = 0; i < arr1.length; i++) {
								arr1[i] && arr1[i].call(self, scale);
							}
						}
					};
					if (options.zoomEnable) {
						self.pinchZoom.enable();
					} else {
						self.pinchZoom.disable();
					}
				}

				var promise = Promise.resolve();
				var num = Math.floor(100 / self.totalNum).toFixed(2);
				var i = 1;
				for (i = 1; i <= self.totalNum; i++) {
					self.cache[i + ""] = {
						page: null,
						loaded: false,
						container: null,
						scaledViewport: null,
						canvas: null,
						imgWidth: null
					};
					promise = promise.then(function (pageNum) {
						return self.thePDF.getPage(pageNum).then(function (page) {
							setTimeout(function () {
								if (self.options.goto) {
									if (pageNum == self.options.goto) {
										self.goto(pageNum);
									}
								}
							}, 0);
							self.cache[pageNum + ""].page = page;
							var viewport = page.getViewport({ scale: options.scale });
							var scale = (self.docWidth / viewport.width).toFixed(2);
							var scaledViewport = page.getViewport({ scale: parseFloat(scale) });
							var div = self.container.querySelector('.pageContainer' + pageNum);
							var container;
							if (!div) {
								container = document.createElement('div');
								container.className = 'pageContainer pageContainer' + pageNum;
								container.setAttribute('name', 'page=' + pageNum);
								// container.setAttribute('title', 'Page ' + pageNum);
								var loadEffect = document.createElement('div');
								loadEffect.className = 'loadEffect';
								container.appendChild(loadEffect);
								self.viewer.appendChild(container);
								if (window.ActiveXObject || "ActiveXObject" in window) {
									container.style.width = viewport.width + 'px';
									container.style.height = viewport.height + 'px';
									container.style.width = viewport.width + 'px';
									container["data-scale"] = viewport.width / viewport.height;
								} else {
									var h = container.offsetWidth / (viewport.viewBox[2] / viewport.viewBox[3]);
									if (h > viewport.height) {
										h = viewport.height;
									}
									container.style.maxWidth = viewport.width + 'px';
									container.style.maxHeight = viewport.height + 'px';
									// container.style.minHeight = h + 'px';
									container["data-scale"] = viewport.width / viewport.height;
								}
							} else {
								container = div;
							}
							if (options.background) {
								/*背景颜色*/
								if (options.background.color) {
									container.style["background-color"] = options.background.color;
								}
								/*背景图片*/
								if (options.background.image) {
									container.style["background-image"] = options.background.image;
								}
								/*平铺与否*/
								if (options.background.repeat) {
									container.style["background-repeat"] = options.background.repeat;
								}
								/*背景图片位置*/
								if (options.background.position) {
									container.style["background-position"] = options.background.position;
								}
								/*背景图像的尺寸*/
								if (options.background.size) {
									container.style["background-size"] = options.background.size;
								}
							}
							self.cache[pageNum + ""].container = container;
							self.cache[pageNum + ""].scaledViewport = scaledViewport;
							var sum = 0, containerH = self.container.offsetHeight;
							self.pages = self.viewerContainer.querySelector('.pageContainer');
							if (options.resize) {
								window.addEventListener("resize", self.fn2);
							}
							if (options.renderType === "svg") {
								return self.renderSvg(page, scaledViewport, pageNum, num, container, options, viewport);
							}
							return self.renderCanvas(page, scaledViewport, pageNum, num, container, options);
						});
					}.bind(null, i));
				}
			}).catch(function (err) {
				self.loading.style.display = "none";
				console.log(err);
			});
		},
		renderSvg: function (page, scaledViewport, pageNum, num, container, options, viewport) {
			var self = this;
			var viewport = page.getViewport(options.scale);
			var scale = (self.docWidth / viewport.width).toFixed(2);
			return page.getOperatorList().then(function (opList) {
				var svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs);
				return svgGfx.getSVG(opList, scaledViewport).then(function (svg) {
					self.loadedCount++;
					container.firstChild.style.display = "none";
					container.appendChild(svg);
					svg.style.width = "100%";
					svg.style.height = "100%";
					if (self.options.loadingBar) {
						self.progress.style.width = num * self.loadedCount + "%";
					}
					var time = new Date().getTime();
					var arr1 = self.eventType["render"];
					if (arr1 && arr1 instanceof Array) {
						for (var i = 0; i < arr1.length; i++) {
							arr1[i] && arr1[i].call(self, pageNum, time - self.initTime, container);
						}
					}
					if (self.loadedCount === self.totalNum) {
						self.finalRender(options);
					}
				});
			}).then(function () {
				return page.getTextContent();
			}).then(function (textContent) {
				if (!self.options.textLayer) {
					return;
				}
				if (container.querySelector(".textLayer")) {
					return;
				}
				var textLayerDiv = document.createElement('div');
				textLayerDiv.setAttribute('class', 'textLayer');
				container.appendChild(textLayerDiv);
				viewport.width = viewport.width * scale;
				viewport.height = viewport.height * scale;
				var textLayer = new TextLayerBuilder({
					textLayerDiv: textLayerDiv,
					pageIndex: page.pageIndex,
					viewport: viewport
				});

				textLayer.setTextContent(textContent);
				textLayer.render();
			});;
		},
		renderCanvas: function (page, viewport, pageNum, num, container, options) {
			var self = this;
			var viewport = page.getViewport({ scale: options.scale });
			var scale = (self.docWidth / viewport.width).toFixed(2);
			var canvas = document.createElement("canvas");
			var obj2 = {
				'Cheight': viewport.height * scale,
				'width': viewport.width,
				'height': viewport.height,
				'canvas': canvas,
				'index': self.loadedCount
			};
			var context = canvas.getContext('2d');
			if (options.logo) {
				context.drawImage(self.options.logo.img, self.options.logo.x * self.options.scale,
					self.options.logo.y * self.options.scale, self.options.logo.width * self.options.scale, self.options.logo.height * self.options.scale
				);
			}
			canvas.height = viewport.height;
			canvas.width = viewport.width;
			if (self.options.loadingBar) {
				self.progress.style.width = num * self.loadedCount + "%";
			}
			var renderObj = {
				canvasContext: context,
				viewport: viewport
			};
			if (options.background) {
				renderObj.background = "rgba(255, 255, 255, 0)";
			}
			return page.render(renderObj).promise.then(async function () {
				if (options.logo) {
					context.drawImage(self.options.logo.img, self.options.logo.x * self.options.scale, self.options.logo.y * self.options.scale, self.options.logo.width * self.options.scale, self.options.logo.height * self.options.scale);
				}
				self.loadedCount++;
				var time = new Date().getTime();
				var time2 = 0;
				if (self.renderTime == 0) {
					time2 = time - self.startTime;
				} else {
					time2 = time - self.renderTime;
				}
				obj2.src = obj2.canvas.toDataURL("image/png");

				canvas.className = "canvasImg" + pageNum;
				canvas.setAttribute("data-o-key", canvas.className);
				container.appendChild(canvas);

				container.firstChild.style.display = "none";
				var time = new Date().getTime();
				var arr1 = self.eventType["render"];
				if (arr1 && arr1 instanceof Array) {
					for (var i = 0; i < arr1.length; i++) {
						arr1[i] && arr1[i].call(self, pageNum, time - self.initTime, container);
					}
				}
				if (self.loadedCount === self.totalNum) {
					self.finalRender(options);
				}

				const key = pageNum + "";

				self.cache[key].canvas = canvas;
				self.cache[key].imgWidth = null;

				scale = +(canvas.width / viewport.width);
			}).then(function () {
				return page.getTextContent();
			}).then(function (textContent) {
				if (!self.options.textLayer) {
					return;
				}
				if (container.querySelector(".textLayer")) {
					return;
				}
				var textLayerDiv = document.createElement('div');
				textLayerDiv.setAttribute('class', 'textLayer');
				textLayerDiv.style.width = `${viewport.width}px`;
				textLayerDiv.style.height = `${viewport.height}px`;
				textLayerDiv.style.transform = `scale(${scale})`;

				const key = pageNum + '';
				let count = 0;
				const canvas = self.cache[key].canvas;
				imgObserver.observer(canvas, canvas.className, function (event) {
					let width = canvas.offsetWidth;
					scale = +(width / viewport.width);
					textLayerDiv.style.transform = `scale(${scale})`;
					count++;
				});
				textLayerDiv.style.transformOrigin = `0 0`;
				container.appendChild(textLayerDiv);

				var textLayer = new TextLayerBuilder({
					textLayerDiv: textLayerDiv,
					pageIndex: page.pageIndex,
					viewport: viewport
				});

				textLayer.setTextContent(textContent);
				textLayer.render();
			});
		},
		finalRender: function (options) {
			var time = new Date().getTime();
			var self = this;
			if (self.options.loadingBar) {
				self.progress.style.width = "100%";
			}
			setTimeout(function () {
				self.loadingBar.style.display = "none";
			}, 300);
			self.endTime = time - self.initTime;
			if (options.renderType === "svg") {
				if (self.totalNum !== 1) {
					self.cache[(self.totalNum - 1) + ""].loaded = true;
				} else {
					self.cache["1"].loaded = true;
				}
			}
			if (options.zoomEnable) {
				if (self.pinchZoom) {
					self.pinchZoom.enable();
				}
			} else {
				if (self.pinchZoom) {
					self.pinchZoom.disable();
				}
			}
			var arr1 = self.eventType["complete"];
			if (arr1 && arr1 instanceof Array) {
				for (var i = 0; i < arr1.length; i++) {
					arr1[i] && arr1[i].call(self, "success", "pdf加载完成", self.endTime);
				}
			}
			var arr2 = self.eventType["success"];
			if (arr2 && arr2 instanceof Array) {
				for (var i = 0; i < arr2.length; i++) {
					arr2[i] && arr2[i].call(self, self.endTime);
				}
			}
		},
		show: function (callback) {
			this.container.style.display = "block";
			callback && callback.call(this);
			var arr = this.eventType["show"];
			if (arr && arr instanceof Array) {
				for (var i = 0; i < arr.length; i++) {
					arr[i] && arr[i].call(this);
				}
			}
		},
		hide: function (callback) {
			this.container.style.display = "none";
			callback && callback.call(this);
			var arr = this.eventType["hide"];
			if (arr && arr instanceof Array) {
				for (var i = 0; i < arr.length; i++) {
					arr[i] && arr[i].call(this);
				}
			}
		},
		on: function (type, callback) {
			if (this.eventType[type] && this.eventType[type] instanceof Array) {
				this.eventType[type].push(callback);
			}
			this.eventType[type] = [callback];
		},
		off: function (type) {
			if (type !== undefined) {
				this.eventType[type] = [null];
			} else {
				for (var i in this.eventType) {
					this.eventType[i] = [null];
				}
			}
		},
		goto: function (num) {
			var self = this;
			if (!isNaN(num)) {
				if (self.viewerContainer) {
					self.pages = self.viewerContainer.querySelectorAll('.pageContainer');
					if (self.pages) {
						var h = 0;
						var signHeight = 0;
						if (num - 1 > 0) {
							signHeight = self.pages[0].getBoundingClientRect().height;
						}
						self.viewerContainer.scrollTo({
							top: signHeight * (num - 1) + 8 * num,
							behavior: "smooth"
						});
					}
				}
			}
		},
		scrollEnable: function (flag) {
			if (flag === false) {
				this.viewerContainer.style.overflow = "hidden";
			} else {
				this.viewerContainer.style.overflow = "auto";
			}
			var arr = this.eventType["scrollEnable"];
			if (arr && arr instanceof Array) {
				for (var i = 0; i < arr.length; i++) {
					arr[i] && arr[i].call(this, flag);
				}
			}
		},
		zoomEnable: function (flag) {
			if (!this.pinchZoom) {
				return;
			}
			if (flag === false) {
				this.pinchZoom.disable();
			} else {
				this.pinchZoom.enable();
			}
			var arr = this.eventType["zoomEnable"];
			if (arr && arr instanceof Array) {
				for (var i = 0; i < arr.length; i++) {
					arr[i] && arr[i].call(this, flag);
				}
			}
		},
		download: function (name, callback) {
			if (this.options.pdfurl) {
				download(this.options.pdfurl, name, callback);
			} else if (this.options.data) {
				fileDownLoad(this.options.data, name, callback);
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
				this.viewerContainer.scrollTop = 0;
			}
			callback && callback.call(this);
			var arr = this.eventType["reset"];
			if (arr && arr instanceof Array) {
				for (var i = 0; i < arr.length; i++) {
					arr[i] && arr[i].call(this);
				}
			}
		},
		destroy: function (callback) {
			this.backTop.removeEventListener("click", this.fn1);
			this.backTop.removeEventListener("tap", this.fn1);
			window.removeEventListener("resize", this.fn2);
			this.reset();
			this.off();
			if (this.thePDF) {
				this.thePDF.destroy();
				this.thePDF = null;
			}
			if (this.viewerContainer) {
				this.viewerContainer.parentNode.removeChild(this.viewerContainer);
				this.viewerContainer = null;
			}
			if (this.container) {
				this.container.html('');
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
			callback && callback.call(this);
			var arr = this.eventType["destroy"];
			if (arr && arr instanceof Array) {
				for (var i = 0; i < arr.length; i++) {
					arr[i] && arr[i].call(this);
				}
			}
		}
	};
	return Pdfh5;

	function download(url, name, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = "blob";
		if (Object.prototype.toString.call(name) === "[object Function]") {
			callback = name;
			name = undefined;
		}
		name = name ? name : "download.pdf";
		if (name.indexOf(".pdf") == -1) {
			name += ".pdf";
		}
		xhr.onload = function () {
			if (this.status === 200) {
				var blob = this.response;
				var reader = new FileReader();
				reader.readAsDataURL(blob);
				reader.onload = function (e) {
					var a = document.createElement('a');
					a.download = name;
					a.href = e.target.result;
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);
					callback && callback();
				};
			}
		};
		xhr.send();
	}

	function fileDownLoad(data, name, callback) {
		if (Object.prototype.toString.call(name) === "[object Function]") {
			callback = name;
			name = undefined;
		}
		name = name ? name : "download.pdf";
		if (name.indexOf(".pdf") == -1) {
			name += ".pdf";
		}
		var array = null;
		try {
			var enc = new TextDecoder('utf-8');
			array = JSON.parse(enc.decode(new Uint8Array(data)));
		} catch (err) {
			if (Object.prototype.toString.call(data) === "[object ArrayBuffer]") {
				array = data;
			} else {
				if (Object.prototype.toString.call(data) === "[object Array]") {
					array = new Uint8Array(data);
				} else {
					var rawLength = data.length;
					array = new Uint8Array(new ArrayBuffer(rawLength));
				}
				for (var i = 0; i < rawLength; i++) {
					array[i] = data.charCodeAt(i) & 0xff;
				}
			}
			var blob = new Blob([array]);
			var a = document.createElement('a');
			var url = window.URL.createObjectURL(blob);
			a.download = name;
			a.href = url;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			callback && callback();
		}

	}
});
