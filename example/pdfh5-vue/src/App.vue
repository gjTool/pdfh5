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
      pdfurl: "http://www.gjtool.cn/pdfh5/default.pdf",
      lazy:true 
    });
    this.pdfh5.on("render", function (pageNum, time) {
      console.log("当前加载页码：" + pageNum + "，耗时：" + time + "毫秒，总页数：" + this.totalNum)
    })
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
