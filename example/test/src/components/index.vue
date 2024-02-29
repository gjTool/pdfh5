<template>
  <div>
    <el-tabs style="height: 100px">
      <el-tab-pane label="xxxx">xxxx</el-tab-pane>
      <el-tab-pane label="ffff">ffff</el-tab-pane>
      <el-tab-pane label="dddd">dddd</el-tab-pane>
      <el-tab-pane label="jjjj">jjjj</el-tab-pane>
    </el-tabs>
  </div>
</template>
  <script>
export default {
  data() {
    return {};
  },
};
</script>
  <style lang="less" scoped>
.el-tabs {
  .el-tabs__header {
    .el-tabs__item {
      &.is-active {
        color: greenyellow;
      }
    }
  }
}
</style>