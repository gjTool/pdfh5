<script setup lang="ts">
import Pdfh5 from 'pdfh5';
import { ref, onMounted } from 'vue';
const demo = ref()
onMounted(() => {
  new Pdfh5(demo.value, {
    pdfurl: "./git.pdf"
  });
});
</script>

<template>
  <div class="demo" ref="demo"></div>
</template>

<style scoped>
.demo {
  width: 100%;
  height: 100%;
}
</style>
