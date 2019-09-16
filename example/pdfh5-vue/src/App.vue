<template>
  <div id="app">
    <div id="demo"></div>
  </div>
</template>
<script>
import Pdfh5 from "pdfh5";
export default {
  name: "App",
  data() {
    return {
      pdfh5: null
    }
  },
  mounted() {
    //实例化
    this.pdfh5 = new Pdfh5("#demo", {
      pdfurl: "//www.gjtool.cn/pdfh5/git.pdf",
      renderType:"canvas",
      lazy:true
    });
    //监听完成事件
    this.pdfh5.on("complete", function(status, msg, time) {
      console.log(
        "状态：" +
          status +
          "，信息：" +
          msg +
          "，耗时：" +
          time +
          "毫秒，总页数：" +
          this.totalNum
      );
    });
  }
};
</script>

<style>
@import "pdfh5/css/pdfh5.css";
* {
  padding: 0;
  margin: 0;
}
html,
body,
#app {
  width: 100%;
  height: 100%;
}
</style>
