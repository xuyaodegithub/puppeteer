// 简单的说 Node.js 就是运行在服务端的 JavaScript。
// Node.js 是一个基于Chrome JavaScript 运行时建立的一个平台。
// Node.js是一个事件驱动I/O服务端JavaScript环境，基于Google的V8引擎，V8引擎执行Javascript的速度非常快，性能非常好。

// var res=[
//     {"planId":1,"creditsPerMonth":100,"price":10.00,"status":null,"paypalPlanId":"P-4DM86836PV295002W3LCXONI"},
//     {"planId":2,"creditsPerMonth":200,"price":18.00,"status":null,"paypalPlanId":"P-7P427524BD822771E3LC23GQ"},
//     {"planId":3,"creditsPerMonth":500,"price":40.00,"status":null,"paypalPlanId":"P-55J2161056220784S3LC4IGY"},
//     {"planId":4,"creditsPerMonth":1000,"price":70.00,"status":null,"paypalPlanId":"P-6JY84603A2498482H3LC5XFQ"},
//     {"planId":5,"creditsPerMonth":2000,"price":120.00,"status":null,"paypalPlanId":"P-0SA24900WE88003043LC7O3Y"},
//     {"planId":6,"creditsPerMonth":5000,"price":250.00,"status":null,"paypalPlanId":"P-3YS19308MH067163P3LDBVVI"}
// ]
//  module.exports=res


const puppeteer = require('puppeteer');
const path=require('path');
const http = require('http');
const fs = require('fs');
// (async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto('https://cn.vuejs.org/');
//     await page.setViewport({width:1500,height:800})//设置生成拖大小，默认800*600
//     await page.screenshot({path: 'picup.png'});//生成png图片
//     // await page.pdf({path: 'hn.pdf', format: 'A4'});//生成pdf
//
//     await browser.close();
// })();
// (async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto('https://example.com');
//     await page.setViewport({width:1500,height:800})//设置生成拖大小，默认800*600
//     // Get the "viewport" of the page, as reported by the page.
//     const dimensions = await page.evaluate(() => {
//         return {
//             width: document.documentElement.clientWidth,
//             height: document.documentElement.clientHeight,
//             deviceScaleFactor: window.devicePixelRatio
//         };
//     });
//
//     console.log('Dimensions:', dimensions);
//
//     await browser.close();
// })();


//通过搜索引擎保存图片
(async ()=>{
    const brower = await puppeteer.launch();
    const page = await brower.newPage();
    await page.goto("https://www.taobao.com/");
    await page.setViewport({
        width:1920,
        height:1080
    })    //上面的代码和之前是一样的，不同是下面几句
    //
    // await page.focus("#kw");
    // await page.keyboard.sendCharacter("赛车");
    await page.click("a.h")

    await page.waitFor(1000);    //监听页面 load 完成
    page.on('load',async ()=>{
        console.log("page loaded");
        const srcs = await page.evaluate(()=> {
            const images = document.querySelectorAll("td a");
            return Array.prototype.map.call(images,img=>img.innerHTML)
        })        //遍历图片并且保存
        // srcs.forEach(async (src)=> {
        //     const ext = path.extname(src) ? path.extname(src):".jpg";
        //     const file = path.join('./imgs',`${Date.now()}${ext}`)
        //     http.get(src,res=>{
        //         console.log(res)
        //         res.pipe(fs.createWriteStream(file)).on('finish',(err)=>{
        //             if(err){
        //                 console.log(err)
        //         } else {
        //                 console.log("done")
        //         }
        //         })
        //     })
        // })
        await brower.close()
    })
})()


// (async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto("https://uland.taobao.com/sem/tbsearch?refpid=mm_26632258_3504122_32538762&clk1=ae58acc289d02c488a4f507a6bcd7dc2&keyword=%E7%94%B5%E8%84%91&page=0");
//     console.log(await page.content());
// })();
