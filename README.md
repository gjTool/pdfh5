# pdfh5.js v1.2.22

[![npm version](https://img.shields.io/npm/v/pdfh5.svg)](https://www.npmjs.com/package/pdfh5) [![npm downloads](https://img.shields.io/npm/dt/pdfh5.svg)](https://www.npmjs.com/package/pdfh5)   [![MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/gjTool/pdfh5/blob/master/LICENSE) [![GitHub issues](https://img.shields.io/github/issues/gjTool/pdfh5.svg)](https://github.com/gjTool/pdfh5/issues) [![GitHub stars](https://img.shields.io/github/stars/gjTool/pdfh5.svg?style=social)](https://github.com/gjTool/pdfh5/stargazers) [![GitHub forks](https://img.shields.io/github/forks/gjTool/pdfh5.svg?style=social)](https://github.com/gjTool/pdfh5/network/members)  

**pdfh5.js 基于pdf.js和jQuery，web/h5/移动端PDF预览手势缩放插件。支持canvas和svg两种渲染模式，支持ajax和fetch两种请求方式。支持懒加载。**


- [pdfh5博客主页](https://www.gjtool.cn/)  

- [pdfh5项目GitHub地址](https://github.com/gjTool/pdfh5)  

- [pdfh5打包下载](https://www.gjtool.cn/download/pdfh5.zip)  



![pdfh5.js示例](https://img-blog.csdnimg.cn/20190731133403792.gif)

## 更新信息

- 2019.11.27 更新：  1. 新增配置项属性limit，限制pdf加载最大页数。


### pdfh5在线预览 （建议使用谷歌浏览器F12手机模式打开预览）

-  [https://www.gjtool.cn/pdfh5/pdf.html?file=https://www.gjtool.cn/pdfh5/default.pdf](https://www.gjtool.cn/pdfh5/pdf.html?file=https://www.gjtool.cn/pdfh5/default.pdf)  


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

- 	3.依次引入js   

```javascript
<script src="js/pdf.js" type="text/javascript" charset="utf-8"></script>
<script src="js/pdf.worker.js" type="text/javascript" charset="utf-8"></script>
<script src="js/jquery-1.11.3.min.js" type="text/javascript" charset="utf-8"></script>
<script src="js/pdfh5.js" type="text/javascript" charset="utf-8"></script>
```

- 	4.实例化

```javascript
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
		pdfurl: "../../static/test.pdf"
	  });
	  //监听完成事件
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

# API接口方法

- **注意： pdf路径地址用相对路径加载速度最快，网络地址比较慢，本地绝对路径地址不能加载。** 
- **注意： pdf路径地址用相对路径加载速度最快，网络地址比较慢，本地绝对路径地址不能加载。** 
- **注意： pdf路径地址用相对路径加载速度最快，网络地址比较慢，本地绝对路径地址不能加载。** 

## 实例化
- **pdfh5实例化的时候传两个参数，selector选择器，options配置项参数，options可以不填写，会自动获取浏览器地址栏？file=后面的地址。会返回一个pdfh5实例对象，可以用来操作pdf，监听相关事件** 
```javascript
var pdfh5 = new Pdfh5(selector, options);
```
|参数名称|类型|取值|是否必须|作用|
|:---:|:---:|:---:|:---:|:---:|
|selector|  {String} | - | √ |pdfh5的容器选择器|
|options|  {Object} | - | × |pdfh5的配置项参数|

## options配置项参数列表

- **示例：** 配置项参数 lazy:true 开启懒加载，默认是false,不开启懒加载

```javascript
var pdfh5 = new Pdfh5('#demo', {
	pdfurl: "./default.pdf",
	lazy:true 
});
```

|参数名称|类型|取值|作用|
|:---:|:---:|:---:|:---:|
|pdfurl|  {String} | - |pdf地址，当前默认优先获取浏览器地址栏？file=后面的地址，如果地址栏没有，再拿配置项的pdfurl或者data来渲染pdf，优先顺序： ？file= > pdfurl > data |
|URIenable|  {Boolean} |true、false， 默认true | 可以无视地址栏参数，只拿配置项的pdfurl或者data来渲染pdf |
|data|  {String(blob) / Array(Uint8Array)} | - |pdf文件流 ，与pdfurl二选一。可以传普通文件流blob，也可以传转过码的Uint8Array|
|type| {String}|"ajax"、"fetch"，默认"fetch"|请求pdf方式|
|renderType| {String}|"canvas"、"svg"，默认"svg"|pdf渲染模式|
|scale| {Number}|默认1.3。canvas模式下，为2|渲染的清晰度比例|
|lazy| {Boolean}|true、false， 默认false|是否开启懒加载|
|maxZoom|  {Number}|默认4|手势缩放最大倍数|
|tapZoomFactor|  {Number}|默认2| 双击放大倍数|
|scrollEnable| {Boolean}|true、false， 默认true|是否允许pdf滚动|
|zoomEnable| {Boolean}|true、false， 默认true|是否允许pdf手势缩放|
|cMapUrl| {String}| 默认"./js/cmaps/"|解析pdf时，特殊情况下显示完整字体的cmaps文件夹路径，例如 cMapUrl:"https://unpkg.com/pdfjs-dist@2.0.943/cmaps/"|
|limit| {Number}| 默认0 |限制pdf加载最大页数|

## 	pdf文件流请求示例（以jq ajax为例）
1.
```javascript
$.ajax({
	url: "https://gjtool.cn/pdfh5/git.pdf", //假设这是pdf文件流的请求接口
	type: "get",
	mimeType: 'text/plain; charset=x-user-defined',//jq ajax请求文件流的方式
	cache: false,
	success: function (data) {
		var pdfh5 = new Pdfh5('#demo', {
			data: data
		});
	}
});
```
2.
```javascript
$.ajax({
	url: "https://gjtool.cn/pdfh5/git.pdf", //假设这是pdf文件流的请求接口
	type: "get",
	mimeType: 'text/plain; charset=x-user-defined',//jq ajax请求文件流的方式
	cache: false,
	success: function (data) {
		var rawLength = data.length;
		var array = new Uint8Array(new ArrayBuffer(rawLength));
		for (i = 0; i < rawLength; i++) {
		    array[i] = data.charCodeAt(i) & 0xff;
		}
		var pdfh5 = new Pdfh5('#demo', {
			data: array
		});
	}
});
```
3.
```javascript
$.ajax({
	url: "https://gjtool.cn/pdfh5/git.pdf", //假设这是pdf文件流的请求接口
	type: "get",
	mimeType: 'text/plain; charset=x-user-defined',//jq ajax请求文件流的方式
	cache: false,
	success: function (data) {
		var rawLength = data.length;
		var array = [];
		for (i = 0; i < rawLength; i++) {
		    array.push(data.charCodeAt(i) & 0xff);
		}
		var pdfh5 = new Pdfh5('#demo', {
			data: array
		});
	}
});
```
## methods 方法列表

- **示例：** 是否允许pdf滚动

```javascript
pdfh5.scrollEnable(true) //允许pdf滚动
pdfh5.scrollEnable(false) //不允许pdf滚动
```

|参数名称|类型|取值|作用|
|:---:|:---:|:---:|:---:|
|scrollEnable| {Boolean}|true、false， 默认true|是否允许pdf滚动|
|zoomEnable| {Boolean}|true、false， 默认true|是否允许pdf手势缩放|
|show| {Function}|带一个回调函数参数|pdfh5显示|
|hide| {Function}|带一个回调函数参数|pdfh5隐藏|
|reset| {Function}|带一个回调函数参数|pdfh5还原|
|destroy| {Function}|带一个回调函数参数|pdfh5销毁|
|on| {String, Function}|String：监听的事件名，Function：监听的事件回调|on方法监听所有事件|


## on方法监听所有事件-事件名列表

- **示例：** 监听pdf准备开始渲染，此时可以拿到pdf总页数

```javascript
pdfh5.on("ready", function () {
	console.log("总页数：" + this.totalNum)
})
```
|参数名称|回调|作用|
|:---:|:---:|:---:|
|init| {Function}|监听pdfh5开始初始化|
|ready| {Function}|监听pdf准备开始渲染，此时可以拿到pdf总页数|
|error| {Function(msg,time))}|监听加载失败，msg信息，time耗时 |
|success| {Function(msg,time))}| 监听pdf渲染成功，msg信息，time耗时|
|complete| {Function(status, msg, time)}| 监听pdf加载完成事件，加载失败、渲染成功都会触发。status有两种状态success和error|
|render| {Function(currentNum, time, currentPageDom)}| 监听pdf渲染过程，currentPageDom当前加载的pdf的dom,currentNum当前加载的pdf页数,|
|zoom| {Function(scale)}| 监听pdf缩放，scale缩放比例|
|scroll| {Function(scrollTop)}| 监听pdf滚动，scrollTop滚动条高度|
|backTop| {Function}| 监听回到顶部按钮的点击事件回调|
|zoomEnable| {Function(flag)}| 监听允许缩放，flag：true，false|
|scrollEnable| {Function(flag)}| 监听允许滚动，flag：true，false|
|show | {Function}| 监听pdfh5显示|
|hide | {Function}| 监听pdfh5隐藏|
|reset | {Function}| 监听pdfh5还原|
|destroy | {Function}| 监听pdfh5销毁|

## 打赏赞助作者：
![支付宝二维码](https://www.gjtool.cn/download/zfb.jpg) ![微信二维码](https://www.gjtool.cn/download/wx.jpg)

- 感谢打赏！请打赏的童鞋在[pdfh5.js打赏榜](https://www.gjtool.cn/articles/2019/09/24/1569327833358.html)留下github、QQ、微信 。然后，我会对打赏过的童鞋的问题及时响应。（当然是在我不忙的时候啦）


## 打赏榜单
- [JayLin](https://github.com/110117ab) ￥6.66
- [靓仔城](https://github.com/ljc7877376) ￥6.67
- 南蓝 ￥8.80
- 我是太阳 ￥29.99
- *小波 ￥1.00 【支付宝留言：“打赏一块钱，我做两天都做不好双指缩放”】
- *鑫 ¥9.99
- *手 ¥9.99
- *勇 ￥19.99 【支付宝留言：“鼓励共享优质代码”】
- *爷 ¥5.00
- *超 ¥20.00
- 3*Y ¥5.00
