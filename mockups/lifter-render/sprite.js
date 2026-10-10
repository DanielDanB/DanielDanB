const { chromium } = require('playwright');
const fs = require('fs');
(async()=>{
 const [N, cols, size, aspect, q, out] = process.argv.slice(2);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
 const p=await b.newPage({viewport:{width:800,height:800}});
 p.on('pageerror',e=>console.log('err',e.message));
 await p.goto('file://'+__dirname+`/lift.html?size=${size}&aspect=${aspect}`);
 await p.waitForFunction('window.done',null,{timeout:90000});
 const url = await p.evaluate(([N,c,q])=>window.sprite(N,c,q), [+N, +cols, +q]);
 fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
 console.log(out, fs.statSync(out).size, url.slice(0,30));
 await b.close();
})();
