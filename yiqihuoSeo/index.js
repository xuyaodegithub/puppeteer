const puppeteer = require('puppeteer'), http = require('http'), path = require('path'), fs = require('fs'),utils = require('../utils/index');
const maxChromeProcessNum = 30;
var currentChromeProcessNum = 0;
async function main(){
    //获取代理ip
    //var api_url = "http://dps.kdlapi.com/api/getdps/?orderid=996816975895731&num=1&pt=2&sep=4";
    // if(currentChromeProcessNum < maxChromeProcessNum){
    //     currentChromeProcessNum ++;
        var options = {
            host: "dps.kdlapi.com",
            port: 80,
            path: "/api/getdps/?orderid=977914332984052&num=1&pt=2&sep=4"
        };
        http.get(options, function(res) {
            res.on('data', function(data) {
                console.log("proxy:"+data);
                init(data);
            }).on('end', function() {

            });
        });
    // }
}
async function init(proxy){
    const browserArgs = [
        "--proxy-server=socks5://"+proxy,
        "--no-sandbox",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
    ];
    const browser = await puppeteer.launch({headless:false,defaultViewport:{width:1920,height:1080},slowMo:50,args:browserArgs})
    const page = await browser.newPage();
    const navigationPromise = page.waitForNavigation({timeout:0})
    await page.setRequestInterception(true);
   // await page.on('request', request => {
   //      if (request.resourceType() === 'image'){
   //          console.log(request,999);
   //          request.abort();
   //      }
   //      else
   //          request.continue();
   //  });
   await page.on('request', interceptedRequest => {
        if (interceptedRequest.url().endsWith('.png') || interceptedRequest.url().endsWith('.jpg')){
            // console.log(interceptedRequest,999);
            interceptedRequest.abort();
        }
        else
            interceptedRequest.continue();
    });
    // page.on('load',async ()=>{
    //     console.log("page loaded");
    //     await page.evaluate(utils.js1)
    //     await page.evaluate(utils.js3)
    //     await page.evaluate(utils.js4)
    //     await page.evaluate(utils.js5)
    //     await page.waitFor(5000);
    //     //点击一下站内链接，降低跳出率
    //
    // });
    console.log(111)
    await page.goto('http://www.17huo.com/',{timeout:0});
    // await navigationPromise;
    console.log(222)
    await otherOperation(page,navigationPromise,browser)
    // await upPage.click('.el-button')
    // await browser.close()
}

async function otherOperation(page,navigationPromise,browser){
    await page.waitFor(getrandom(2000,5000))
    var scrollTimer =  page.evaluate(() => {
        return new Promise((resolve, reject) => {
            var totalHeight = 0
            var distance = 100
            var timer = setInterval(() => {
                window.scrollBy(0, distance)
                totalHeight += distance
                if(totalHeight >= document.body.scrollHeight){
                    // window.scrollTo(0, 500)
                    clearInterval(timer)
                    resolve()
                }
            }, 100)
        })

    })
    scrollTimer.then(async (res)=>{
     await initclick(page,navigationPromise,browser)
    })
}


async function initclick(page,navigationPromise,browser){
    const link = await page.$$('.footer_rp_flk .fl a');
    // const idx=parseInt(Math.random()*link.length)
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));    // 声明变量
    await link[getrandom(0,link.length-1)].click();                             // 点击跳转
    const newPage = await newPagePromise;
    await navigationPromise;
    await page.waitFor(getrandom(2000,5000));
    var scrollTimer2 = newPage.evaluate(() => {
        return new Promise((resolve, reject) => {
            var totalHeight = 0;
            // var distance = 50;
            var timer = setInterval(() => {
                const distance=Math.floor(Math.random() * (200 - 30 + 1)) + 30;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if(totalHeight >= document.body.scrollHeight){
                    // window.scrollTo(0, 500)
                    clearInterval(timer)
                    resolve()
                }
            },Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000)
        })

    })
    scrollTimer2.then(async ()=>{
       await newPage.close();
        // await initclick(page,navigationPromise,browser)
       await browser.close();
        setTimeout(main,getrandom(1000,3000));
    })
}
function getrandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
try{
    main()
}catch (e) {
    main()
}
