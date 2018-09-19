# pdfh5


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

//pdfh5支持在线预览 http://www.gjtool.cn/pdfh5/pdf.html?file=http://www.gjtool.cn/pdfh5/default.pdf

