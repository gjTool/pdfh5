<template>
  <div id="demo"></div>
</template>
<script>
import Pdfh5 from "pdfh5";
export default {
  name: "HelloWorld",
  data() {
    return {
      pdfh5: null
    };
  },
  mounted() {
    this.pdfh5 = new Pdfh5("#demo", {
      pdfurl: "./assets/default.pdf"
    });
    this.pdfh5.on("complete", function (status, msg, time) {
      console.log("状态：" + status + "，信息：" + msg + "，耗时：" + time + "毫秒，总页数：" + this.totalNum)
    })
  }
};
</script>
<style scoped>
  @import "pdfh5/css/pdfh5.css";
</style>
