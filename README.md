# pdfh5
## 2019.07.10更新：新增部分api，配置参数。内部渲染机制改动：canvas转img 改成 直接渲染svg。


	当前默认优先获取浏览器地址栏？file=后面的地址，如果地址栏没有，再拿配置项的pdfurl或者data来渲染pdf
	优先顺序：  ？file= > pdfurl > data
	var pdfh5 = new Pdfh5('.pdfjs', {
		pdfurl: "./default.pdf"
	});
	配置项参数 URIenable:false 可以无视地址栏参数，只拿配置项的pdfurl或者data来渲染pdf
	var pdfh5 = new Pdfh5('.pdfjs', {
		URIenable:false,
		pdfurl: "./default.pdf"
	});

	pdf准备开始渲染，此时可以拿到pdf总页数
	pdfh5.on("ready", function () {
		console.log("总页数：" + this.totalNum)
	})

	监听pdf渲染过程，currentPageDom当前加载的pdf的dom,currentNum当前加载的pdf页数,
	pdfh5.on("render", function (currentNum, time, currentPageDom) {
		console.log("当前渲染页：" + currentNum + "，耗时：" + time + "毫秒")
	})

	监听完成事件，加载失败、渲染成功都会触发
	pdfh5.on("complete", function (status, msg, time) {
		console.log("状态：" + status + "，信息：" + msg + "，耗时：" + time + "毫秒，总页数：" + this.totalNum)
	})

	监听pdf渲染成功
	pdfh5.on("success", function (time) {
		console.log("加载完成，耗时" + time + "毫秒")
	})

	配置项参数 是否显示小部件 加载进度loadingBar 页面显示pageNum 回到顶部backTop  默认显示
	var pdfh5 = new Pdfh5('.pdfjs', {
			loadingBar: false,
		pageNum:false,
		backTop:false
	});

	配置项参数data，文件流形式传入  pdfurl和data二选一
	var pdfh5 = new Pdfh5('.pdfjs', {
		data: data
	});

	配置项参数scrollEnable:false不允许pdf滚动,true允许pdf滚动  默认允许
	var pdfh5 = new Pdfh5('.pdfjs', {
		scrollEnable:false,//是否允许pdf滚动
		pdfurl: url
	});
	pdfh5.scrollEnable(true)允许pdf滚动,pdfh5.scrollEnable(false)不允许pdf滚动

	配置项参数zoomEnable:false不允许pdf手势缩放,true允许pdf手势缩放  默认允许
	var pdfh5 = new Pdfh5('.pdfjs', {
		zoomEnable:false,//是否允许pdf滚动
		pdfurl: url
	});
	pdfh5.zoomEnable(true)允许pdf手势缩放，pdfh5.zoomEnable(false)不允许pdf手势缩放

	pdfh5还原、销毁（附带回调函数）：   pdfh5.reset pdfh5.destroy 
	pdfh5显示、隐藏（附带回调函数）：   pdfh5.show pdfh5.hide 

	on方法,监听各种事件： 开始初始化 init 准备渲染pdf ready 加载完成 complete 加载失败 error 加载成功 success 渲染pdf中 render
	缩放zoom   滚动scroll 显示show  隐藏hide 还原reset 销毁destroy  允许缩放zoomEnable 允许滚动scrollEnable
	pdfh5.on("init",function(){
		
	})
	pdfh5.on("ready",function(){
		
	})
	pdfh5.on("complete",function(status,msg,time){
		this.zoomEnable(false)
	})


##### pdfh5支持在线预览 
[http://www.gjtool.cn/pdfh5/pdf.html?file=http://www.gjtool.cn/pdfh5/default.pdf](http://www.gjtool.cn/pdfh5/pdf.html?file=http://www.gjtool.cn/pdfh5/default.pdf)  
	

