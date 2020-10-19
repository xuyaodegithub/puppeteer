const puppeteer = require( 'puppeteer' ), http = require( 'http' ), path = require( 'path' ), fs = require( 'fs' ),
    utils = require( '../utils/index' );
const maxChromeProcessNum = 5;
var currentChromeProcessNum = 0;
main()

async function main() {
    //获取代理ip
    //var api_url = "http://dps.kdlapi.com/api/getdps/?orderid=996816975895731&num=1&pt=2&sep=4";
    if (currentChromeProcessNum < maxChromeProcessNum) {
        currentChromeProcessNum++;
        var options = {
            host: "dps.kdlapi.com",
            port: 80,
            // path: "/api/getdps/?orderid=978392088801261&num=1&pt=2&sep=4"//1w
            path: "/api/getdps/?orderid=988330455178145&num=1&pt=2&sep=4"//3000
            // http://xushengjing:kb0q85gz@ip:端口/
        };
        http.get( options, function (res) {
            res.on( 'data', function (data) {
                console.log( "proxy:" + data );
                init( data );
            } ).on( 'end', function () {

            } );
        } );
        var staySenconds = Math.floor( (Math.random() * 30) ) + 10;
        setTimeout( main, staySenconds * 1000 );
    }
}

async function init(proxy) {
    const userid = Math.floor( (Math.random() * 5000) );
    // console.log(__dirname)
    const userDir = `D:/新建文件夹/userDir/${userid}/`;
    const browserArgs = [
        "--proxy-server=socks5://" + proxy,
        // "--proxy-server=http://xushengjing:kb0q85gz@"+proxy+'/',
        "--no-sandbox",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
    ];
    const browser = await puppeteer.launch( {
        // headless: false,
        defaultViewport: {width: 1920, height: 1080},
        slowMo: 50,
        args: browserArgs,
        userDataDir: userDir
    } )
    setTimer(browser)
    // console.log(browserArgs)
    const page = await browser.newPage();
    const navigationPromise = page.waitForNavigation( {timeout: 0} )
    await page.on( 'error', async () => {
        await browser.close()
        currentChromeProcessNum--
        setTimeout( main, getrandom( 1000, 3000 ) );
    } )
    await page.setRequestInterception( true );
    await page.on( 'request', interceptedRequest => {
        if (interceptedRequest.url().endsWith( '.png' ) || interceptedRequest.url().endsWith( '.jpg' )) {
            // console.log(interceptedRequest,999);
            interceptedRequest.abort();
        } else
            interceptedRequest.continue();
    } );
    await page.goto( 'http://www.17huo.com/', {timeout: 0} );
    await page.on( 'pageerror', async () => {
        await browser.close()
        currentChromeProcessNum--
        setTimeout( main, getrandom( 1000, 3000 ) );
    } )
    await otherOperation( page, navigationPromise, browser )
    // await upPage.click('.el-button')
    // await browser.close()
}

async function otherOperation(page, navigationPromise, browser) {
    await page.waitFor( getrandom( 2000, 5000 ) )
    var scrollTimer = page.evaluate( () => {
        return new Promise( (resolve, reject) => {
            var totalHeight = 0
            var distance = 100
            var timer = setInterval( () => {
                window.scrollBy( 0, distance )
                totalHeight += distance
                if (totalHeight >= document.body.scrollHeight) {
                    // window.scrollTo(0, 500)
                    clearInterval( timer )
                    resolve()
                }
            }, 100 )
        } )

    } )
    scrollTimer.then( async (res) => {
        await initclick( page, navigationPromise, browser )
    } )
}


async function initclick(page, navigationPromise, browser) {
    const link = await page.$$( '.footer_rp_flk .fl a' );
    // const idx=parseInt(Math.random()*link.length)
    const newPagePromise = new Promise( x => browser.once( 'targetcreated', target => x( target.page() ) ) );    // 声明变量
    await link[getrandom( 0, link.length - 1 )].click();                             // 点击跳转
    const newPage = await newPagePromise;
    await navigationPromise;
    await page.waitFor( getrandom( 2000, 5000 ) );
    var scrollTimer2 = newPage.evaluate( () => {
        return new Promise( (resolve, reject) => {
            var totalHeight = 0;
            // var distance = 50;
            var timer = setInterval( () => {
                const distance = Math.floor( Math.random() * (200 - 30 + 1) ) + 30;
                window.scrollBy( 0, distance );
                totalHeight += distance;
                if (totalHeight >= (document.body.scrollHeight-document.documentElement.clientHeight)) {
                    // window.scrollTo(0, 500)
                    clearInterval( timer )
                    resolve()
                }
            }, Math.floor((Math.random()*1800))+1000 )
        } )

    } )
    scrollTimer2.then( async () => {
        const oA = await newPage.$$( '.footer_rp_flk .fl a' );
        // console.log(oA.length,'dede')
        // await oA[getrandom( 0, oA.length - 1 )].click();
        // await newPage.waitFor( getrandom( 2000, 5000 ) );
        // await newPage.close();
        await matting(newPage,browser,`.footer_rp_flk .fl li:nth-child(${getrandom( 2, oA.length)}) a`)
        await newPage.close();
        await matting(page,browser,'.xu_nav .margin > a:nth-child(6)')
        await matting(page,browser,'.xu_nav .margin > a:last-child')

        // await initclick(page,navigationPromise,browser)
        await browser.close();
        currentChromeProcessNum--;
        console.log( currentChromeProcessNum );
        setTimeout( main, getrandom( 1000, 3000 ) );
    } )
}

function getrandom(min, max) {
    return Math.floor( Math.random() * (max - min + 1) ) + min;
}

setInterval( () => {
    // currentChromeProcessNum = 10
    // setTimeout( () => {
        currentChromeProcessNum = 0
        console.log('restore----------------------')
        main()
    // }, 300000 )
}, 600000 )
async function matting(page,browser,str){
    //点击抠图
    const matting1 = await page.$( str );
    // const idx=parseInt(Math.random()*link.length)
    const newPagePromise = new Promise( x => browser.once( 'targetcreated', target => x( target.page() ) ) );    // 声明变量
    await matting1.click();                             // 点击跳转
    const newPage1 = await newPagePromise;
    await newPage1.waitFor(getrandom( 10000, 15000 ))
    await newPage1.close();
    //点击抠图2
}
async function setTimer(browser){
    setTimeout(()=>{
        if(browser)browser.close()
    },600000)
}
