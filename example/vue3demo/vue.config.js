const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      fallback: {
        "canvas": false,
        "fs": false,
        "http": false,
        "https": false,
        "url": false,
        "zlib": false
      }
    }
  }
});
