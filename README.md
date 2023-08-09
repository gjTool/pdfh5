# pdfh5.js
[![npm version](https://img.shields.io/npm/v/pdfh5.svg)](https://www.npmjs.com/package/pdfh5) [![npm downloads](https://img.shields.io/npm/dt/pdfh5.svg)](https://www.npmjs.com/package/pdfh5) [![npm downloads](https://img.shields.io/npm/dw/pdfh5.svg)](https://www.npmjs.com/package/pdfh5)  [![MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/gjTool/pdfh5/blob/master/LICENSE) [![GitHub issues](https://img.shields.io/github/issues/gjTool/pdfh5.svg)](https://github.com/gjTool/pdfh5/issues) [![GitHub stars](https://img.shields.io/github/stars/gjTool/pdfh5.svg?style=social)](https://github.com/gjTool/pdfh5/stargazers) [![GitHub forks](https://img.shields.io/github/forks/gjTool/pdfh5.svg?style=social)](https://github.com/gjTool/pdfh5/network/members)  

**有问题可以加Q群咨询，技术交流群，也可以探讨技术，另有微信群可以问群主拉入微信群**

- [QQ群521681398](https://qm.qq.com/cgi-bin/qm/qr?k=3_qouxqe5w3gRCcHjpqkwtx-4yS6QSPD&jump_from=webapi&authKey=FlHU4wH2xOQUthUpgF5W3b1VXowCVmSRfJLU4GRcDVyBayJd1ank4HkOWSZei2f3)
- [pdfh5博客主页](https://pdfh5.gjtool.cn/)  

- [pdfh5项目GitHub地址](https://github.com/gjTool/pdfh5)  

- [pdfh5项目gitee地址](https://gitee.com/gjTool/pdfh5)


#### react、vue均可使用
#### [example/test](https://github.com/gjTool/pdfh5/tree/master/example/test)是vue使用示例
#### [example/vue3demo](https://github.com/gjTool/pdfh5/tree/master/example/vue3demo)是vue3使用示例
#### [example/vite4vue3](https://github.com/gjTool/pdfh5/tree/master/example/vite4vue3)是vite4+vue3+ts使用示例
#### [example/react-test](https://github.com/gjTool/pdfh5/tree/master/example/react-test)是react使用示例

![pdfh5.js示例](https://img-blog.csdnimg.cn/20190731133403792.gif)

## 更新信息

- 2023.07.13 更新： 新增vite4+vue3+ts示例，完善vu2测试例子

### pdfh5在线预览 （建议使用谷歌浏览器F12手机模式打开预览）

-  [https://www.gjtool.cn/pdfh5/pdf.html?file=https://www.gjtool.cn/pdfh5/git.pdf](https://www.gjtool.cn/pdfh5/pdf.html?file=https://www.gjtool.cn/pdfh5/git.pdf)  


## 快速使用（有两种方式）

#### 一、script标签引入方式（需下载本项目文件夹css/pdfh5.css、js内所有文件）

- 	1.引入css   

```javascript
<link rel="stylesheet" href="css/pdfh5.css" />
```

- 	2.创建div  

```javascript
<div id="demo"></div>
```

- 	3.依次引入js（需引用本项目的js,不要引用官方的pdf.js,jquery可以引用其它版的）   

```javascript
<script src="js/pdf.js" type="text/javascript" charset="utf-8"></script>
<script src="js/pdf.worker.js" type="text/javascript" charset="utf-8"></script>
<script src="js/jquery-2.1.1.min.js" type="text/javascript" charset="utf-8"></script>
<script src="js/pdfh5.js" type="text/javascript" charset="utf-8"></script>
```

- 	4.实例化

```javascript
var pdfh5 = new Pdfh5('#demo', {
  pdfurl: "./default.pdf"
});
```

####  二、npm安装方式（适应于vue）, react使用方法类似vue（example/react-test是react使用示例）

- 	1.安装

```javascript
npm install pdfh5
```
- 	2.使用

```javascript
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
		//实例化
	  this.pdfh5 = new Pdfh5("#demo", {
		pdfurl: "../../static/test.pdf",
		// cMapUrl:"https://unpkg.com/pdfjs-dist@3.8.162/cmaps/",
		// responseType: "blob" // blob arraybuffer
	  });
	  //监听完成事件
	  this.pdfh5.on("complete", function (status, msg, time) {
		console.log("状态：" + status + "，信息：" + msg + "，耗时：" + time + "毫秒，总页数：" + this.totalNum)
		//禁止手势缩放
		this.pdfh5.zoomEnable(false);
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

- **注意：如果css引用报错的话，按下面的方式引用。** 
```javascript
  import Pdfh5 from "pdfh5";
  import "pdfh5/css/pdfh5.css";
```

# API接口方法


## 实例化
- **pdfh5实例化的时候传两个参数，selector选择器，options配置项参数，会返回一个pdfh5实例对象，可以用来操作pdf，监听相关事件** 
```javascript
var pdfh5 = new Pdfh5(selector, options);
```
|参数名称	|类型		|取值	|是否必须	|作用				|
|:---:		|:---:		|:---:	|:---:		|:---:				|
|selector	|  String	| -		| √		|pdfh5的容器选择器	|
|options	|  Object	| -		| ×			|pdfh5的配置项参数	|

## options配置项参数列表

- **示例：** 配置项参数 pdfurl

```javascript
var pdfh5 = new Pdfh5('#demo', {
	pdfurl: "./default.pdf"
});
```

|参数名称		|类型					|取值																																								|作用																																							|
|:---:			|:---:					|:---:																																								|:---:																																							|
|pdfurl			|  String				| -																																									|pdf地址																																						|
|responseType			|  String				|blob 、 arraybuffer 默认 blob																																							|请求pdf数据格式																																					|
|URIenable		|  Boolean			|true、false， 默认false																																			|  true开启地址栏file参数																																		|
|data			|  Array(arraybuffer)	| -																																									|pdf文件流 ，与pdfurl二选一(二进制PDF数据。使用类型化数组（Uint8Array）可以提高内存使用率。如果PDF数据是BASE64编码的，请先使用atob（）将其转换为二进制字符串。)	|
|renderType		| String				|"canvas"、"svg"，默认"canvas"																																		|pdf渲染模式																																					|
|pageNum		| Boolean				|true、false， 默认true																																				|是否显示左上角页码																																				|
|backTop		| Boolean				|true、false， 默认true																																				|是否显示右下角回到顶部按钮																																		|
|lazy			| Boolean				|true、false， 默认false																																			|是否开启懒加载(实际是延迟加载图片，即屏幕滚动到pdf位置时加载图片)																								|
|maxZoom		|  Number				|最大倍数3																																							|手势缩放最大倍数																																				|
|scale			|  Number				|最大比例5，默认1.5																																					|pdf渲染的比例																																					|
|scrollEnable	| Boolean				|true、false， 默认true																																				|是否允许pdf滚动																																				|
|zoomEnable		| Boolean				|true、false， 默认true																																				|是否允许pdf手势缩放																																			|
|cMapUrl		| String				| "																																|解析pdf时，特殊情况下显示完整字体的cmaps文件夹路径，例如 cMapUrl:"https://unpkg.com/pdfjs-dist@2.0.943/cmaps/"													|
|limit			| Number				| 默认0																																								|限制pdf加载最大页数																																			|
|logo			| Object				|{src:"pdfh5.png",x:10,y:10,width:40,height:40}src水印图片路径（建议使用png透明图片），width水印宽度，height水印高度，以每页pdf左上角为0点，x、y为偏移值。 默认false|给每页pdf添加水印logo（canvas模式下使用）																														|
|goto			| Number				| 默认0																																								|加载pdf跳转到第几页																																			|
|textLayer		|  Boolean		| true、false， 默认false																																			|是否开启textLayer，可以复制文本（canvas模式下使用）【处于测试阶段，位置偏移严重】																				|
|background		|  Object				| {color:"#fff",image:"url('pdfh5.png')",repeat:"no-repeat",position:"left top",size:"40px 40px"}，和css的background属性语法相同，默认false							|是否开启背景图模式																																				|

- 以下属性可选

|参数名称			|类型		|取值		|作用																																					|
|:---:				|:---:		|:---:		|:---:																																					|
|httpHeaders		| Object	| 默认空	|设置httpHeaders信息																																	|
|withCredentials	| Boolean	| 默认false	|是否使用cookie或授权标头之类的凭据发出跨站点访问																										|
|password			| String	| 默认空	|用于访问有密码的PDF																																	|
|stopAtErrors		| Boolean	| 默认false	|当无法成功解析关联的PDF数据时，停止解析																												|
|disableFontFace	| Boolean	| 默认false	|默认情况下，字体会转换为OpenType字体，并通过字体规则来加载。如果禁用，字体将使用内置的字体渲染器渲染。													|
|disableRange		| Boolean	| 默认false	|禁用范围请求加载PDF文件。启用后，如果服务器支持部分内容请求，则将以块的形式获取PDF。																	|
|disableStream		| Boolean	| 默认false	|禁用流式传输PDF文件数据。默认情况下，PDF.js尝试加载成块的PDF。																							|
|disableAutoFetch	| Boolean	| 默认false	|禁用PDF文件数据的预取。启用范围请求后，即使不需要显示当前页面，PDF.js也会自动继续获取更多数据。默认值为“ false”。注意：还必须禁用流传输disableStream	|

## 	pdf请求示例
1.
```javascript
new Pdfh5('#demo', {
	pdfurl: "git.pdf",
	// responseType: "blob" // blob arraybuffer
});
```


3. pdf文件流或者buffer已经得到，如何渲染
```javascript
 new Pdfh5('#demo', {
 	data: blob,  //blob arraybuffer
 });
```
## methods 方法列表

- **示例：** 是否允许pdf滚动

```javascript
pdfh5.scrollEnable(true) //允许pdf滚动
pdfh5.scrollEnable(false) //不允许pdf滚动
```

|方法名			|传参				|传参取值															|作用											|
|:---:			|:---:				|:---:																|:---:											|
|scrollEnable	| Boolean			|true、false， 默认true												|是否允许pdf滚动(需要在pdf加载完成后使用)		|
|zoomEnable		| Boolean			|true、false， 默认true												|是否允许pdf手势缩放(需要在pdf加载完成后使用)	|
|show			| Function		|带一个回调函数														|pdfh5显示										|
|hide			| Function		|带一个回调函数														|pdfh5隐藏										|
|reset			| Function		|带一个回调函数														|pdfh5还原										|
|destroy		| Function		|带一个回调函数														|pdfh5销毁										|
|on				| (String, Function)|String：监听的事件名，Function：监听的事件回调						|on方法监听所有事件								|
|goto			| Number			|Number:要跳转的pdf页数												|pdf跳转到第几页（pdf加载完成后使用）			|
|download		| (String, Function)|String：下载pdf的名称，默认download.pdf，Function：下载完成后的回调|下载pdf										|

## on方法监听所有事件-事件名列表

- **示例：** 监听pdf准备开始渲染，此时可以拿到pdf总页数

```javascript
pdfh5.on("ready", function () {
	console.log("总页数：" + this.totalNum)
})
```
|事件名			|回调											|作用																				|
|:---:			|:---:											|:---:																				|
|init			| Function									|监听pdfh5开始初始化																|
|ready			| Function									|监听pdf准备开始渲染，此时可以拿到pdf总页数											|
|error			| Function(msg,time)						|监听加载失败，msg信息，time耗时													|
|success		| Function(msg,time)							| 监听pdf渲染成功，msg信息，time耗时												|
|complete		| Function(status, msg, time)				| 监听pdf加载完成事件，加载失败、渲染成功都会触发。status有两种状态success和error	|
|render			| Function(currentNum, time, currentPageDom)	| 监听pdf渲染过程，currentPageDom当前加载的pdf的dom,currentNum当前加载的pdf页数,	|
|zoom			| Function(scale)								| 监听pdf缩放，scale缩放比例														|
|scroll			| Function(scrollTop,currentNum)				| 监听pdf滚动，scrollTop滚动条高度,currentNum当前页码								|
|backTop		| Function									| 监听回到顶部按钮的点击事件回调													|
|zoomEnable		| Function(flag)								| 监听允许缩放，flag：true，false													|
|scrollEnable	| Function(flag)								| 监听允许滚动，flag：true，false													|
|show			| Function									| 监听pdfh5显示																		|
|hide			| Function									| 监听pdfh5隐藏																		|
|reset			| Function									| 监听pdfh5还原																		|
|destroy		| Function									| 监听pdfh5销毁																		|

## 打赏榜单
- [JayLin](https://github.com/110117ab) ￥6.66
- [靓仔城](https://github.com/ljc7877376) ￥6.67
- 南蓝 ￥8.80
- 我是太阳 ￥29.99
- *小波 ￥1.00
- *鑫 ¥9.99
- *手 ¥9.99
- *勇 ￥19.99 
- *爷 ¥5.00
- *超 ¥20.00
- 3*Y ¥5.00
- *阳 ¥5.00
- **雄 ¥5.00
- A*r ¥1.23
- *客 ¥5.00
- *运 ¥66.66
- *辰 ¥30.00
- *黎 ¥6.66+¥5.00
- **福 ¥6.66
- *🏀 ¥6.66+¥1.00
- *阳 ¥10.00
- 自闭中 ¥16.66+¥16.00
- *焕 ¥6.66
- *人 ¥5.00
- *。 ¥5.20
- 半*) ¥5.00
- *1 ¥15.00
- *蕾 ¥16.66+¥8.80
- *军 ¥10.00
- **强 ¥58.88
- E*y ¥6.60
- J*u ¥13.00
- A*a ¥50.00
- *东 ¥8.80
- j*y ¥9.99
- *宇 ¥6.66
- *涛 ￥1.00
- *. ￥10.00
- *☺ ￥6.66
- *霸 ￥6.66
- a*r ￥20.00
- 木槿(**耀) ￥50.00
