const puppeteer = require('puppeteer'),cluster = require('cluster'),fs = require('fs'),  cheerio = require('cheerio');
const devices = require('puppeteer/DeviceDescriptors');
var pageNum=1,stopPage=false;
async function test2(type=1,Keyword='杭州代发',num=10) {
    const strs=type== 1 ? '#kw' : type== 2 ? '#input' : type==3 ? '#query' : '#kw';
    const seachBtn=type== 1 ? '#su' : type== 2 ? '#search-button' : type==3 ? '#stb' : '.submit';
    const urls=type== 1 ? 'https://www.baidu.com/' : type==2 ? 'https://www.so.com/' : type==3 ? 'https://www.sogou.com/' : 'https://m.sm.cn/' ;  //1百度  2是360  3搜狗  4神马
    const iPhone = devices['iPhone 6'];
    const browser = await puppeteer.launch({headless:false,defaultViewport:{width:1920,height:1080},slowMo:50})
    const page = await browser.newPage()
    if(type==4) await page.emulate(iPhone);
    const navigationPromise = page.waitForNavigation({timeout:0,waitUntil:'domcontentloaded'});
    await page.goto(urls,{timeout:0});
    await page.focus(strs).then(async ()=>{
        await page.keyboard.type(Keyword);
    });
    await page.click(seachBtn);
    await navigationPromise;
   await getDataList(page,navigationPromise,num,type,browser);
    // await browser.close()
}
async function  getDataList(page,navigationPromise,num,type,browser){//百度
    console.log(pageNum)
    await page.waitForSelector('#content_left',{timeout: 0})
    await otherOperation(page,navigationPromise,num,type,browser)
}

async function otherOperation(page,navigationPromise,num,type,browser){
    let scrollTimer = doScroll(page)
    scrollTimer.then(async (res)=>{
        const len = await page.$$eval('#content_left > div',el => el.length);
        const idx=Math.floor(Math.random()*len)
        await page.waitFor(2000)
        console.log(idx)
        const link = await page.$(`#content_left > div:nth-child(${idx}) .t a`);
        const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));    // 声明变量
        await link.click();                             // 点击跳转
        const newPage = await newPagePromise;
        await navigationPromise;
        await newPage.waitFor(10000);
        await newPage.close();
        let ress = await page.$$eval('#content_left > div',el => el.map(el => el.innerHTML));
        const oDom=ress.find(item=>item.indexOf('一起火')>-1 && item.indexOf('17huo')>-1);
        const index=ress.indexOf(oDom);
        if(index>-1){
             stopPage=true;
             const link=await page.$(`#content_left > div:nth-child(${index+1}) .t a`);
             const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));    // 声明变量
             await link.click();                             // 点击跳转
             const newPage = await newPagePromise;
             await newPage.waitForNavigation({timeout:0,waitUntil:'domcontentloaded'});
              toDoSome(newPage,browser);
            return
        }
        const pageStor=await page.$eval('#page > strong span:last-child',el => el.innerText);//获取当前页数
        const pageA=await page.$$eval('#page > a',el => el.map(el=>el.innerText));//获取需要点击的页数
        const pageIdx=pageA.indexOf(String(+pageStor+1))//获取需要点击的页数位置
        await page.click(`#page a:nth-child(${+pageStor+1})`)
        const timer=setInterval(async ()=>{
            const otext=await page.$eval('#page strong span:last-child',el=> el.innerText)
            if(otext==(pageNum+1)){
                clearInterval(timer)
                pageNum+=1;
                await getDataList(page,navigationPromise,num,type,browser)
            }
        },200)
    })
}

async function doScroll(page){
    let scrollTimer = page.evaluate(() => {
        return new Promise((resolve, reject) => {
            let totalHeight = 0
            let distance = 100
            let timer = setInterval(() => {
                window.scrollBy(0, distance)
                totalHeight += distance
                if(totalHeight >= document.body.scrollHeight){
                    window.scrollTo(0, Math.random()*500)
                    clearInterval(timer)
                    resolve()
                }
            }, 100)
        })
    })
 return scrollTimer
}



async function toDoSome(page,browser){//目标游览器操作
    let scrollTimer2 = doScroll(page)
    scrollTimer2.then(async ()=>{
        const link=await page.$(`.xu_nav .margin > a:nth-child(3)`)
        const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));    // 声明变量
        await link.click();                             // 点击跳转
        const newPage = await newPagePromise;
        await newPage.waitForNavigation({timeout:0,waitUntil:'domcontentloaded'});
    })
}



test2(1,'杭州女装网',2)

//  exports.test=test2;
// module.exports=test2;
