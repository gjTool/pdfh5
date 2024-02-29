<template>
  <div id="app">
    <div id="demo"></div>
  </div>
</template>
<script>
import Pdfh5 from 'pdfh5';
export default {
  name: 'App',
  data() {
    return {
      pdfh5: null
    };
  },
  mounted() {
    this.pdfh5 = new Pdfh5('#demo', {
      pdfurl: "./static/git.pdf"
    });
    this.pdfh5.on("scroll", function (scrollTop, currentNum) {
      console.log("scrollTop:" + scrollTop, "currentNum:" + currentNum);
    });

  }
};
</script>

<style>
@import 'pdfh5/css/pdfh5.css';

* {
  padding: 0;
  margin: 0;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
}</style>
