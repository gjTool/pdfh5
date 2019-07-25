# pdfh5

[![npm version](https://img.shields.io/npm/v/pdfh5.svg)](https://www.npmjs.com/package/pdfh5)
[![npm downloads](https://img.shields.io/npm/dt/pdfh5.svg)](https://www.npmjs.com/package/pdfh5)

pdfh5.js 基于pdf.js和jQuery，移动端PDF预览插件，可手势缩放，支持懒加载（即分段加载）。
- 最近才算闲下来了，新建了一个QQ前端学习交流群，欢迎加入前端交流h5，651601340，可以进来提pdfh5.js的bug、问题、建议等。
- **[https://github.com/gjTool/pdfh5](如果觉得插件还行，请帮忙随手点个star吧)**

## 更新信息

- 2019.07.23更新：修复懒加载bug，优化懒加载。

- 2019.07.17更新：新增配置参数lazy，支持懒加载。

- 2019.07.10更新：新增部分api，配置参数。内部渲染机制改动：canvas转img 改成 直接渲染svg。

### pdfh5在线预览 （建议使用谷歌浏览器F12手机模式打开预览）
[http://www.gjtool.cn/pdfh5/pdf.html?file=http://www.gjtool.cn/pdfh5/default.pdf](http://www.gjtool.cn/pdfh5/pdf.html?file=http://www.gjtool.cn/pdfh5/default.pdf)  

## 快速使用

#### 一、script标签引入方式

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

- 	配置项参数 lazy:true 开
