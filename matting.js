const puppeteer = require('puppeteer'),cluster = require('cluster');
async function init(){
    const browser = await puppeteer.launch({executablePath:'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',headless:false,defaultViewport:{width:1920,height:1080}})
    const page = await browser.newPage()

    const navigationPromise = page.waitForNavigation(['load','networkidle0'],{timeout:0})

    await page.goto('https://www.baidu.com/')

    // await page.setViewport({ width: 1920, height: 888 })

    await page.focus('#kw').then(async ()=>{
        await page.keyboard.type('一起火');
    });
    await page.click('#su');
    await navigationPromise
    await page.waitForSelector('#content_left',{timeout: 0});
    const link = await page.$('.t a');
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));    // 声明变量
    await link.click();                             // 点击跳转
    const newPage = await newPagePromise;           // newPage就是a链接打开窗口的Page对象
    await navigationPromise;
    await navigationPromise;
    // console.log(await browser.pages()[1],1111111111111)
    await newPage.waitForSelector('body > .xu_nav > .margin > a:nth-child(7)',{timeout: 0});
    const uplink=await newPage.$('.xu_nav > .margin > a:nth-child(7)')
    const newPagePromises = new Promise(x => browser.once('targetcreated', target => x(target.page())));    // 声明变量
    await uplink.click();                             // 点击跳转
    const upPage = await newPagePromises;           // newPage就是a链接打开窗口的Page对象
    await navigationPromise;
    const input= await upPage.waitForSelector('input[type=file]',{timeout: 0});
    input.uploadFile('./imgs/1.jpg');
    await navigationPromise;
    // await upPage.click('.el-button')
    // await browser.close()
}
const numCPUs = require('os').cpus().length;
if(cluster.isMaster){
    for(let i=0;i<numCPUs;i++){
        // cluster.fork()
        cluster.fork(init())
    }
}
