# pdfh5

[![npm version](https://img.shields.io/npm/v/pdfh5.svg)](https://www.npmjs.com/package/pdfh5)
[![npm downloads](https://img.shields.io/npm/dt/pdfh5.svg)](https://www.npmjs.com/package/pdfh5)

pdfh5.js 基于pdf.js和jQuery，移动端PDF预览插件，可手势缩放，支持懒加载（即分段加载）。
- 最近才算闲下来了，新建了一个QQ前端学习交流群，欢迎加入前端交流h5，651601340，可以进来提pdfh5.js的bug、问题、建议等。
- [**如果觉得插件还行，请帮忙随手点个star吧(GitHub)**](https://github.com/gjTool/pdfh5)

## 语言

- [English](https://github.com/gjTool/pdfh5/blob/master/README-EN.md)

- [中文](https://github.com/gjTool/pdfh5/blob/master/README.md)

![pdfh5.js示例](https://img-blog.csdnimg.cn/20190731133403792.gif)

## 更新信息

- 2019.08.01更新：新增配置项参数type,可以在实例化的时候选择请求方式。默认是type:"fetch",可以更改为type:"ajax"。在某些情况下，pdf.js自带的fetch请求方式会耗时非常严重，所以增加ajax请求方式来给使用者多样化的选择。

- **2019.07.29 重要更新：**  新增配置项参数renderType，可以在实例化的时候选择渲染模式。默认是renderType:"svg",可以更改为renderType:"canvas"。
新增这个参数是因为pdf.js有个bug，当渲染模式为svg的时候，pdf的电子签章（即红色印章）无法显示。只有渲染模式为canvas的时候才可以显示。不过canvas模式下，内存占用大，清晰度也不如svg。选择哪种渲染模式请使用者自行选择。当renderType:"canvas"时，懒加载无效。

- 2019.07.23更新：修复懒加载bug，优化懒加载。

- 2019.07.17更新：新增配置参数lazy，支持懒加载。

- 2019.07.10更新：新增部分api，配置参数。内部渲染机制改动：canvas转img 改成 直接渲染svg。

### pdfh5在线预览 （建议使用谷歌浏览器F12手机模式打开预览）
[http://www.gjtool.cn/pdfh5/pdf.html?file=http://www.gjtool.cn/pdfh5/default.pdf](http://www.gjtool.cn/pdfh5/pdf.html?file=http://www.gjtool.cn/pdfh5/default.pdf)  

## 快速使用

#### 一、script标签引入方式（需下载本项目文件夹css、js内所有文件）

- 	1.引入css   

```
<link rel="stylesheet" href="css/pdfh5.css" />
```

- 	2.创建div  

```
<div id="demo"></div>
```

- 	3.依次引入js   

```
<script src="js/pdf.js" type="text/javascript" charset="utf-8"></script>
<script src="js/pdf.worker.js" type="text/javascript" charset="utf-8"></script>
<script src="js/jquery-1.11.3.min.js" type="text/javascript" charset="utf-8"></script>
<script src="js/pdfh5.js" type="text/javascript" charset="utf-8"></script>
```

- 	4.实例化

```
var pdfh5 = new Pdfh5('#demo', {
  pdfurl: "./default.pdf"
});
```

####  二、npm安装方式（适应于vue）

- 	1.安装

```
npm install pdfh5
```
- 	2.使用

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
		console.log("状态：" + status + "，信息：" + msg + "，耗时：" + time + "毫秒，总页数：" + this.totalNum)
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

### API接口方法

- 	当前默认优先获取浏览器地址栏？file=后面的地址，如果地址栏没有，再拿配置项的pdfurl或者data来渲染pdf
	优先顺序：  ？file= > pdfurl > data

```
var pdfh5 = new Pdfh5('.pdfjs', {
	pdfurl: "./default.pdf"
});
```
- 配置项参数 type:"ajax" 请求方式为ajax，默认fetch

```
var pdfh5 = new Pdfh5('#demo', {
			pdfurl: "./default.pdf",
			type:"ajax"
	});
```
- 配置项参数 maxZoom:3 手势缩放最大倍数，默认4

```
var pdfh5 = new Pdfh5('#demo', {
			pdfurl: "./default.pdf",
			maxZoom:3
	});
```
- 配置项参数 tapZoomFactor:3 双击放大倍数，默认2

```
var pdfh5 = new Pdfh5('#demo', {
			pdfurl: "./default.pdf",
			tapZoomFactor:3
	});
```

-  配置项参数 renderType:"canvas" 渲染模式为canvas，默认svg

```
var pdfh5 = new Pdfh5('#demo', {
		pdfurl: "./default.pdf",
		renderType:"canvas"
});
```
-  配置项参数 scale:2 渲染的清晰度比例，默认1.3

```
var pdfh5 = new Pdfh5('#demo', {
		pdfurl: "./default.pdf",
		renderType:"canvas",
		scale:2
});
```

- 	配置项参数 lazy:true 开启懒加载，默认是false,不开启懒加载（当renderType:"canvas"时，懒加载无效）

```
var pdfh5 = new Pdfh5('#demo', {
		pdfurl: "./default.pdf",
		lazy:true 
});
```

- 	配置项参数 URIenable:false 可以无视地址栏参数，只拿配置项的pdfurl或者data来渲染pdf

```
var pdfh5 = new Pdfh5('.pdfjs', {
	URIenable:false,
	pdfurl: "./default.pdf"
});
```

- 	pdf准备开始渲染，此时可以拿到pdf总页数

```
pdfh5.on("ready", function () {
	console.log("总页数：" + this.totalNum)
})
```

- 	监听pdf渲染过程，currentPageDom当前加载的pdf的dom,currentNum当前加载的pdf页数,

```
pdfh5.on("render", function (currentNum, time, currentPageDom) {
	console.log("当前渲染页：" + currentNum + "，耗时：" + time + "毫秒")
})
```

- 	监听完成事件，加载失败、渲染成功都会触发

```
pdfh5.on("complete", function (status, msg, time) {
	console.log("状态：" + status + "，信息：" + msg + "，耗时：" + time + "毫秒，总页数：" + this.totalNum)
})
```

- 	监听pdf渲染成功

```
pdfh5.on("success", function (time) {
	console.log("加载完成，耗时" + time + "毫秒")
})
```

- 	配置项参数 是否显示小部件 顶部绿色加载进度条loadingBar 左上角页码显示pageNum 右下角回到顶部按钮backTop  默认显示

```
var pdfh5 = new Pdfh5('.pdfjs', {
	loadingBar: false,
	pageNum:false,
	backTop:false
});
```

- 	配置项参数data，文件流形式传入  pdfurl和data二选一

```
	var pdfh5 = new Pdfh5('.pdfjs', {
		data: data
	});
```

- 	配置项参数scrollEnable:false不允许pdf滚动,true允许pdf滚动  默认允许

```
var pdfh5 = new Pdfh5('.pdfjs', {
	scrollEnable:false,//是否允许pdf滚动
	pdfurl: url
});
```

```
pdfh5.scrollEnable(true)允许pdf滚动,pdfh5.scrollEnable(false)不允许pdf滚动
```

- 	配置项参数zoomEnable:false不允许pdf手势缩放,true允许pdf手势缩放  默认允许

```
var pdfh5 = new Pdfh5('.pdfjs', {
	zoomEnable:false,//是否允许pdf手势缩放
	pdfurl: url
});
```
```
pdfh5.zoomEnable(true)允许pdf手势缩放，pdfh5.zoomEnable(false)不允许pdf手势缩放
```
- 	pdfh5还原、销毁（附带回调函数）：   

```
pdfh5.reset(callback) pdfh5.destroy(callback)
```

- 	pdfh5显示、隐藏（附带回调函数）：  

``` 
pdfh5.show(callback) pdfh5.hide(callback) 
```

- 	on方法,监听各种事件： 开始初始化init 准备渲染ready 加载完成complete 加载失败error 加载成功success 渲染中render
	缩放zoom   滚动scroll 显示show  隐藏hide 还原reset 销毁destroy  允许缩放zoomEnable 允许滚动scrollEnable

```	
pdfh5.on("error",function(msg,time){
		
})
pdfh5.on("zoom",function(scale){
	
})
pdfh5.on("scroll",function(scrollTop){
	
})
```

	
