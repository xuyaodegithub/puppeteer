let puppeteer = require( 'puppeteer' ), http = require( 'http' ), path = require( 'path' ), fs = require( 'fs' ),
    utils = require( '../utils/index' ),allData,allLength, devices = require('puppeteer/DeviceDescriptors');;
let maxChromeProcessNum =5;
var currentChromeProcessNum = 0;
main()

async function readfile(){
    fs.readFile(`./dataArr.json`,'utf8',async (err,data)=>{
        if(err)console.log(err,'dddddddddddddd')
        else {
            allData=JSON.parse(data);
            allLength=allData.length;
            main()
        }
    })
}
async function main() {
    //获取代理ip
    //var api_url = "http://dps.kdlapi.com/api/getdps/?orderid=996816975895731&num=1&pt=2&sep=4";
    var dataIdx=0;
    if (currentChromeProcessNum < maxChromeProcessNum) {
        currentChromeProcessNum++;
        var options = {
            host: "dps.kdlapi.com",
            port: 80,
            path: "/api/getdps/?orderid=988184771100214&num=1&pt=2&sep=4"
            // http://xushengjing:kb0q85gz@ip:端口/
        };
        http.get( options, function (res) {
            res.on( 'data', function (data) {
                console.log( "proxy:" + data );
                init( data,dataIdx );
            } ).on( 'end', function () {

            } );
        } );
        var staySenconds = Math.floor( (Math.random() * 60) ) + 30;
        setTimeout( main, staySenconds * 1000 );
    }
}

async function init(proxy,dataIdx) {
    let userid = Math.floor( (Math.random() * 1000) );
    const iPhone = devices['iPhone 6'];
    // console.log(__dirname)
    let mobileDir = `D:/新建文件夹/userIp/${userid}/`;
    let browserArgs = [
        "--proxy-server=socks5://" + proxy,
        // "--proxy-server=http://xushengjing:kb0q85gz@"+proxy+'/',
        "--no-sandbox",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
    ];
    let browser = await puppeteer.launch( {
        headless: false,
        defaultViewport: {width: 1920, height: 1080},
        slowMo: 50,
        args: browserArgs,
        userDataDir: mobileDir
    } )
    // console.log(browserArgs)
    let page = await browser.newPage();
    await page.emulate(iPhone);
    // setTimer(page, browser,)
    let navigationPromise = page.waitForNavigation( {timeout: 0} )
    await page.on( 'error', async () => {
        console.log('error',error,1111)
        await browser.close();
        currentChromeProcessNum--;
        setTimeout( main, getrandom( 1000, 3000 ) );
    } )
    await noImage(page)
    await page.goto( 'http://m.17huo.com/mchanpin/3836655.html', {timeout: 0} );
    await initmove(page, navigationPromise, browser,dataIdx)
}
async function initmove(page, navigationPromise, browser,dataIdx) {
    await page.waitFor( getrandom( 2000, 5000 ) );
    console.log(dataIdx,'pppppppppp')
    var scrollTimer2 = page.evaluate( () => {
        return new Promise( (resolve, reject) => {
            var totalHeight = 0;
            // var distance = 50;
            var timer = setInterval( () => {
                let distance = Math.floor( Math.random() * (200 - 30 + 1) ) + 30;
                window.scrollBy( 0, distance );
                totalHeight += distance;
                if (totalHeight >= (document.body.scrollHeight-document.documentElement.clientHeight-200)) {
                    // window.scrollTo(0, 500)
                    clearInterval( timer )
                    resolve()
                }
            }, Math.floor((Math.random()*1000))+500)//Math.floor((Math.random()*5000))+3000
        } )

    } )
    scrollTimer2.then( async () => {
        await page.waitFor(getrandom( 2000, 5000 ) );
        if(dataIdx>=2){
            await page.close()
            await browser.close()
            currentChromeProcessNum--;
            setTimeout(main,2000)
        }else{
            const oA=await page.$$('footer .fot a')
            await oA[getrandom( 0, oA.length-1 )].tap()
            await navigationPromise
            const idx=dataIdx+=1
            await initmove(page, navigationPromise, browser,idx)
        }


    } )
}

function getrandom(min, max) {
    return Math.floor( Math.random() * (max - min + 1) ) + min;
}

setInterval( () => {
    currentChromeProcessNum = 10
    setTimeout( () => {
        currentChromeProcessNum = 0;
        console.log('restore----------------------')
        main()
    }, 300000 )
},1800000 )

async  function noImage(page){//阻止图片加载
    await page.setRequestInterception( true );
    await page.on( 'request', interceptedRequest => {
        if (interceptedRequest.url().endsWith( '.png' ) || interceptedRequest.url().endsWith( '.jpg' )) {
            // console.log(interceptedRequest,999);
            interceptedRequest.abort();
        } else
            interceptedRequest.continue();
    } );
}
async function find17huo(page, navigationPromise, browser,dataIdx){
    await page.waitFor(2000)
    const showDiv=await page.$('.ivk-button')
    if(showDiv){
        console.log('showDiv')
        await page.tap('.ivk-button',{button:'middle'})
        await page.waitFor(500)
        console.log('showDiv2')
        await page.waitForSelector('#popupLead',{timeout:0})
        await page.tap('#popupLead .popup-lead-cancel')
    }
    // let doscall = doScroll(page)
  let  allItem=await page.$$eval('#results > div',el=>el.map(item=>item.innerText)),allTraget=await page.$$('#results > div');
    let idx=allItem.findIndex(item=>(item.includes('www.17huo.com') || item.includes('一起火') ));
    if(idx<0){
        let nowPage=await page.$eval('#page-controller > .new-pagenav',el=>el.innerText),nextDiv=await page.$('#page-controller > .new-pagenav > div');
        console.log(nowPage,333333333333333);
        if(!nextDiv) {
            console.log('pppppp1 ')
            await page.tap('#page-controller > .new-pagenav a')
        } else if(nextDiv && !nowPage.includes('50')){
            console.log('pppppp2')
            await page.tap('#page-controller > .new-pagenav .new-pagenav-right a')
        } else {
            console.log('pppppp3')
            await page.close();
            await browser.close();
            setTimeout(main,2000);
            return;
        }
        await navigationPromise
        await page.waitFor(500);
        // await page.tap(`#page > a:last-child`);
        // // await page.waitFor(500);
        // let timer=setInterval(async ()=>{
        //     const otext=await page.$eval('#page strong ',el=> el.innerText);
        //     console.log(+nowPage+1,otext)
        //     if(+nowPage+1==otext){
        //         clearInterval(timer)
                await find17huo(page, navigationPromise, browser,dataIdx)
        //     }
        // },2000)
    }else{
        // let twoPage=await page.$$(`#content_left .c-container .t a`);
        // let newPagePromise2 = new Promise( x => browser.once( 'targetcreated', target => x( target.page() ) ) );    // 声明变量
        await page.evaluate( () => {window.scrollTo(0,0)}).then(async ()=>{
            console.log(idx,11111111111,'tap after');
            await page.waitFor(800)
            allTraget[idx].tap()
            // await page.tap(`#results > div:nth-child(${idx+1}) .c-result-content`)
            // await twoPage[idx].tap();
            await noImage(page)
            await page.waitFor( getrandom( 2000, 3000 ))
            await initmove(page, navigationPromise, browser,dataIdx)
        })

    }

}

async function initone(page, navigationPromise, browser,dataIdx){
    let dataIdxs=dataIdx;
    if(dataIdxs>=allLength-1)dataIdxs=0;
    if(dataIdxs % 2 ===0 && dataIdxs !==0){
        currentChromeProcessNum--;
        await browser.close();
        setTimeout(()=>{
            main()
        },2000)
    }else {
        dataIdxs++;
        await page.focus('#index-kw').then(async ()=>{
            // await page.keyboard.down('Control');
            // await page.keyboard.press('KeyA');
            // await page.keyboard.up('Control');
            // await page.keyboard.press('Delete');
            // // console.log(dataIdxs)
            await page.keyboard.type(allData[dataIdxs]);
        });
        await page.tap('#index-bn');
        await navigationPromise;
        await page.waitFor(1500)
        await otherOperation(page, navigationPromise, browser,dataIdxs)
    }


}


async function doScroll(page){
    let scrollTimer = page.evaluate(() => {
        return new Promise((resolve, reject) => {
            let totalHeight = 0
            let distance = 100
            let timer = setInterval(() => {
                window.scrollBy(0, distance)
                totalHeight += distance
                if(totalHeight >= document.body.scrollHeight-120){
                    window.scrollTo(0, Math.random()*500)
                    clearInterval(timer)
                    resolve()
                }
            }, 300)
        })
    })
    return scrollTimer
}
