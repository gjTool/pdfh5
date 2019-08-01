# pdfh5

[![npm version](https://img.shields.io/npm/v/pdfh5.svg)](https://www.npmjs.com/package/pdfh5)
[![npm downloads](https://img.shields.io/npm/dt/pdfh5.svg)](https://www.npmjs.com/package/pdfh5)

Pdfh5.js is based on pdf.js and jQuery. The mobile PDF preview plug-in can zoom in and support lazy loading.

- [**If you think the plug-in is OK, please help with  star(for GitHub).**](https://github.com/gjTool/pdfh5)

## Language

- [English](https://github.com/gjTool/pdfh5/blob/master/README-EN.md)

- [中文](https://github.com/gjTool/pdfh5/blob/master/README.md)

![pdfh5.js示例](https://img-blog.csdnimg.cn/20190731133403792.gif)

## Update information

- Update on 08.01, 2019: Add a new configuration parameter type, which allows you to select the request mode when instantiating. The default is type:"fetch", which can be changed to type:"ajax". In some cases, the fetch request mode of pdf.js is very time-consuming, so adding Ajax request mode gives users a variety of choices.

- **Important updates on 07.29, 2019：**  Adding a new configuration parameter renderType allows you to select render mode when instantiating. The default is renderType:"svg", which can be changed to renderType:"canvas".

The new parameter is due to a bug in pdf.js. When the rendering mode is svg, the electronic signature of PDF (i.e. red seal) cannot be displayed. Only when the rendering mode is canvas can it be displayed. However, in canvas mode, the memory consumption is large and the clarity is not as good as svg. The user can choose which rendering mode to use. When renderType: "canvas", lazy loading is invalid.

- Update on 07.23, 2019：Fix lazy loading bug and optimize lazy loading.

- Update on 07.17, 2019: Add configuration parameter lazy to support lazy loading.

- Update on 07.10, 2019：Add some api, configuration parameters. Internal rendering mechanism changes: canvas to img to direct rendering svg.

### Pdfh5 online preview (recommend using Google Browser F12 mobile mode to open preview)
[http://www.gjtool.cn/pdfh5/pdf.html?file=http://www.gjtool.cn/pdfh5/default.pdf](http://www.gjtool.cn/pdfh5/pdf.html?file=http://www.gjtool.cn/pdfh5/default.pdf)  

## Quick Start

#### I. The introduction of script tags (all files in the project folder CSS and JS need to be downloaded)

- 	1.Introducing CSS   

```
<link rel="stylesheet" href="css/pdfh5.css" />
```

- 	2.Create div  

```
<div id="demo"></div>
```

- 	3.Introducing JS in turn   

```
<script src="js/pdf.js" type="text/javascript" charset="utf-8"></script>
<script src="js/pdf.worker.js" type="text/javascript" charset="utf-8"></script>
<script src="js/jquery-1.11.3.min.js" type="text/javascript" charset="utf-8"></script>
<script src="js/pdfh5.js" type="text/javascript" charset="utf-8"></script>
```

- 	4.Instance

```
var pdfh5 = new Pdfh5('#demo', {
  pdfurl: "./default.pdf"
});
```

####  II. NPM installation mode (suitable for vue)

- 	1.Installation

```
npm install pdfh5
```
- 	2.Use

```
<template>
  <div id="app">
	  <div id="demo"></div>
  </div>
</template>
<script>
  import Pdfh5 from "pdfh5";
  export default {
    name: 'App',
	data() {
	  return {
	    pdfh5: null
	  };
	},
	mounted() {
	  this.pdfh5 = new Pdfh5("#demo", {
		pdfurl: "./test.pdf" 
	  });
	  this.pdfh5.on("complete", function (status, msg, time) {
		console.log("status:" + status + ",info:" + msg + ",time-consuming:" + time + "milliseconds, total pages:" + this.totalNum)
	  })
	}
  }
</script>

<style>
	@import "pdfh5/css/pdfh5.css";
	*{
		padding: 0;
		margin: 0;
	}
	html,body,#app {
		width: 100%;
		height: 100%;
	}
</style>
```

### API Interface Method

- 	Currently, the default priority is to get the browser address bar? File = the following address. If the address bar does not exist, render PDF with pdfurl or data of the configuration item.
	Priority：  ？file= > pdfurl > data

```
var pdfh5 = new Pdfh5('.pdfjs', {
	pdfurl: "./default.pdf"
});
```
- Configuration item parameter type: "ajax" request mode is ajax, default fetch.

```
var pdfh5 = new Pdfh5('#demo', {
			pdfurl: "./default.pdf",
			type:"ajax"
	});
```

- Configuration item parameter maxZoom: 3 gesture zoom maximum multiple, default 4.

```
var pdfh5 = new Pdfh5('#demo', {
			pdfurl: "./default.pdf",
			maxZoom:3
	});
```
- Configuration item parameter tapZoomFactor: 3 double-click magnification, default 2。

```
var pdfh5 = new Pdfh5('#demo', {
			pdfurl: "./default.pdf",
			tapZoomFactor:3
	});
```

-  Configuration item parameter renderType: "canvas" rendering mode is canvas, default svg.

```
var pdfh5 = new Pdfh5('#demo', {
		pdfurl: "./default.pdf",
		renderType:"canvas"
});
```
-  Configuration parameter scale: 2 rendering sharpness ratio, default 1.3

```
var pdfh5 = new Pdfh5('#demo', {
		pdfurl: "./default.pdf",
		renderType:"canvas",
		scale:2
});
```

- 	Configuration parameter lazy: true opens lazy loading, default is false, do not open lazy loading. When renderType: "canvas", lazy loading is invalid.

```
var pdfh5 = new Pdfh5('#demo', {
		pdfurl: "./default.pdf",
		lazy:true 
});
```

- 	Configuration parameter URIenable: false can ignore address bar parameters and render PDF only with pdfurl or data of configuration item.

```
var pdfh5 = new Pdfh5('.pdfjs', {
	URIenable:false,
	pdfurl: "./default.pdf"
});
```

- 	Pdf is ready to start rendering, at which point you can get the total number of PDF pages.

```
pdfh5.on("ready", function () {
	console.log("total pages:" + this.totalNum)
})
```

- 	Monitor the PDF rendering process, the dom of PDF currentPageDom currently loaded, and the number of PDF pages currentNum currently loaded.

```
pdfh5.on("render", function (currentNum, time, currentPageDom) {
	console.log("current rendering page:" + currentNum + ",time-consuming:" + time + "milliseconds")
})
```

- 	Listen for completion events, loading failure, rendering success will trigger.

```
pdfh5.on("complete", function (status, msg, time) {
	console.log("status:" + status + ",info:" + msg + ",time-consuming:" + time + "milliseconds, total pages:" + this.totalNum)
})
```

- 	Monitor PDF rendering success.

```
pdfh5.on("success", function (time) {
	console.log("loading completed,time-consuming:"" + time + "milliseconds")
})
```

- 	Listen for PDF rendering success configuration item parameters to show the green loading progress bar at the top of the widget loadingBar upper left page number shows page Num lower right corner back to the top button backTop default display.

```
var pdfh5 = new Pdfh5('.pdfjs', {
	loadingBar: false,
	pageNum:false,
	backTop:false
});
```

- 	Configuration item parameter data, file stream form into pdfurl and data.

```
	var pdfh5 = new Pdfh5('.pdfjs', {
		data: data
	});
```

- 	Configuration parameter scrollEnable: false does not allow PDF scrolling, true allows PDF scrolling by default.

```
var pdfh5 = new Pdfh5('.pdfjs', {
	scrollEnable:false,
	pdfurl: url
});
```

```
pdfh5.scrollEnable(true), allow PDF to scroll. pdfh5.scrollEnable(false), Pdf scrolling is not allowed.
```

- 	Configuration parameter zoomEnable: false does not allow PDF gesture zooming, true allows PDF gesture zooming by default.

```
var pdfh5 = new Pdfh5('.pdfjs', {
	zoomEnable:false,
	pdfurl: url
});
```
```
pdfh5.zoomEnable(true), Allow PDF gesture zooming. pdfh5.zoomEnable(false),Pdf gesture zooming is not allowed.
```
- 	Reduction and destruction of pdfh5 (with callback function):   

```
pdfh5.reset(callback) pdfh5.destroy(callback)
```

- 	Pdfh5 displays and hides (with callback functions): 

``` 
pdfh5.show(callback) pdfh5.hide(callback) 
```

- 	On method, listen for all kinds of events: start initializing init, prepare to render read, complete loading failure, error loading success render

Scaling zoom scroll shows show show hidden restore reset destroy destroy allow zoom Enable to allow scroll Enable

```	
pdfh5.on("error",function(msg,time){
		
})
pdfh5.on("zoom",function(scale){
	
})
pdfh5.on("scroll",function(scrollTop){
	
})
```

	
