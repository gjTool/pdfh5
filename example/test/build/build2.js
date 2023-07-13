const cp = require('child_process');
cp.exec(`npm install canvas --canvas_binary_host_mirror=https://registry.npmmirror.com/-/binary/canvas`, (err, stdout, stderr) => {
    setTimeout(()=>{
        cp.exec(`node build/build.js`, (err, stdout, stderr) => {
        })
    },10000)
})