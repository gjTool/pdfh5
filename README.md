# pdfh5
## 2018.12.20更新：新增部分api。配置项增加scrollEnable:false不允许pdf滚动,true允许pdf滚动。新增方法pdfh5.scrollEnable(true)允许pdf滚动,pdfh5.scrollEnable(false)不允许pdf滚动。新增on方法，监听各种事件，内部this指向pdfh5对象。

2018.12.4更新：解决部分pdf字体显示不全，合同、公文等pdf末尾红色印章无法显示问题。必须下载我提供的pdf.js和pdf.worker.js。后续会放出api文档，以及做成npm包引用（时间待定，暂不支持）

	var pdfh5 = new Pdfh5('.pdfjs', {
		pdfurl: 'default.pdf'
	});

//pdfh5.zoomChange pdfh5.renderPages pdfh5.renderEnd pdfh5.scroll pdfh5.show pdfh5.hide

//pdfh5还有pdfh5开始初始化、pdfh5加载完成、PDF加载失败、PDF加载成功事件：   pdfh5.start pdfh5.complete pdfh5.error pdfh5.success 

//pdfh5还有还原事件、销毁事件（附带回调函数）：   pdfh5.reset pdfh5.destroy 

//pdfh5还有静态参数： 

//pdf最外层div pdfh5.container
//pdf第二层div pdfh5.viewerContainer
//所有包裹pdf的div的父div pdfh5.viewer
//所有包裹pdf的div pdfh5.pages

//pdf加载完成状态 pdfh5.pdfLoaded
//pdf总页数 pdfh5.totalNum
//pdf当前页数 pdfh5.currentNum
//pdfh5初始化的时间戳 pdfh5.initTime
//pdfh5开始渲染距离初始化多少毫秒 pdfh5.startTime
//pdfh5渲染完毕距离初始化多少毫秒  pdfh5.endTime
//pdfh5渲染过程中时间戳   pdfh5.renderTime

//pdfh5支持在线预览 
http://www.gjtool.cn/pdfh5/pdf.html?file=http://www.gjtool.cn/pdfh5/default.pdf
http://118.89.56.33:8999/pdfh5/pdf.html?file=http://118.89.56.33:8999/pdfh5/default.pdf

//新增配置参数scrollEnable:false不允许pdf滚动,true允许pdf滚动

	var pdfh5 = new Pdfh5('.pdfjs', {
 			scrollEnable:false,//是否允许pdf滚动
			pdfurl: url
		});
		
//新增方法pdfh5.scrollEnable(true)允许pdf滚动,pdfh5.scrollEnable(false)不允许pdf滚动

//新增on方法,监听各种事件

	pdfh5.on("start",function(str){
 			console.log(str)
 		})
		pdfh5.on("complete",function(str){
 			pdfh5.scrollEnable(true)
		})

