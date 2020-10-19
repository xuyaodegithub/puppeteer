let puppeteer = require( 'puppeteer' ), http = require( 'http' ), path = require( 'path' ), fs = require( 'fs' ), allData,allLength, devices = require('puppeteer/DeviceDescriptors');;
let maxChromeProcessNum =5;
var currentChromeProcessNum = 0;
readfile()

async function readfile(){
    fs.readFile(`./dataArr4.json`,'utf8',async (err,data)=>{
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
    var dataIdx=getrandom(0,184);
    if (currentChromeProcessNum < maxChromeProcessNum) {
        currentChromeProcessNum++;
        // init( 'data',dataIdx );
        var options = {
            host: "dps.kdlapi.com",
            port: 80,
             path: "/api/getdps/?orderid=978392088801261&num=1&pt=2&sep=4"//1w
             // path: "/api/getdps/?orderid=988330455178145&num=1&pt=2&sep=4"//3000
            // path: "/api/getdps/?orderid=988184771100214&num=1&pt=2&sep=4"//1000
            // http://xushengjing:kb0q85gz@ip:端口/
        };
        http.get( options, function (res) {
            res.on( 'data', function (data) {
                console.log( "proxy:" + data );
               if(data.includes('今日'))return;
                init( data,dataIdx );
            } ).on( 'end', function () {

            } );
        } );
        var staySenconds = Math.floor( (Math.random() * 60) ) + 30;
        setTimeout( main, staySenconds * 1000 );
    }
}

async function init(proxy,dataIdx) {
    let userid = Math.floor( (Math.random() * 5000) );
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
        // headless: false,
        // defaultViewport: {width: 1920, height: 1080},
        slowMo: 100,
        isMobile:true,
        args: browserArgs,
        userDataDir: mobileDir
    } )
    // console.log(browserArgs)
    setTimer(browser)
    let page = await browser.newPage();
    iPhone.viewport.hasTouch = false;
    await page.emulate(iPhone);
    let navigationPromise = page.waitForNavigation( {timeout: 0} )
    await page.on( 'error', async () => {
        console.log('error',error,1111)
        await browser.close();
        currentChromeProcessNum--;
        setTimeout( main, getrandom( 1000, 3000 ) );
    } )
    await noImage(page);
    await page.goto( 'https://www.baidu.com/', {timeout: 0} ).catch(async ()=>{
        await browser.close()
        currentChromeProcessNum--;
        setTimeout( main, getrandom( 1000, 3000 ) );
    });
    await browser.on( 'disconnected', async(err)=>{
        console.log(err,111)
        // await browser.close();
        // currentChromeProcessNum--;
        // init(proxy,dataIdx)
    } )
    // await page.on('requestfailed',async (interceptedRequest)=>{
    //     if (interceptedRequest.url().endsWith( '.png' ) || interceptedRequest.url().endsWith( '.jpg' )) return ;
    //     await browser.close();
    //     currentChromeProcessNum--;
    //     init(proxy,dataIdx)
    // })

    await page.focus('#index-kw').then(async ()=>{
        await page.keyboard.type(allData[dataIdx].kw);
        // await page.keyboard.type('杭州女装批发');
        await page.waitFor(500)
        await page.keyboard.down('Enter');
        // await page.waitForSelector('#index-bn')
        // await page.tap('#index-bn');
        await navigationPromise;
        await otherOperation(page, navigationPromise, browser,dataIdx)
    });
}

async function otherOperation(page, navigationPromise, browser,dataIdx) {
    // await page.waitFor( getrandom( 2000, 5000 ) )
    // let doscall = doScroll(page)
    // doscall.then(async()=>{
    // await page.waitForSelector('#results',{timeout: 0});
    // allPage=await page.$$('.pagination li a')
    console.log('findindex')
    await find17huo(page, navigationPromise, browser,dataIdx)
    // })
}


async function initmove(page, navigationPromise, browser,dataIdx) {
    await page.waitFor( getrandom( 2000, 5000 ) );
    var scrollTimer2 = page.evaluate( () => {
        return new Promise( (resolve, reject) => {
            var totalHeight = 0;
            // var distance = 50;
            var timer = setInterval( () => {
                let distance = Math.floor( Math.random() * (200 - 30 + 1) ) + 30;
                window.scrollBy( 0, distance );
                totalHeight += distance;
                if (totalHeight >= (document.body.scrollHeight-document.documentElement.clientHeight-500)) {
                    // window.scrollTo(0, 500)
                    clearInterval( timer )
                    resolve()
                }
            }, Math.floor((Math.random()*1500))+500)//Math.floor((Math.random()*2500))+1000
        } )

    } )
    scrollTimer2.then( async () => {
        await page.waitFor(getrandom( 2000, 3000 ) );
        const oAlla=await page.$$('section a')
        if(oAlla.length>0){
            oAlla[getrandom(0,oAlla.length-1)].tap();
            await navigationPromise;
            await page.waitFor(4000);
            await initone(page, navigationPromise, browser,dataIdx)
        }else await initone(page, navigationPromise, browser,dataIdx)
    } )
}

function getrandom(min, max) {
    return Math.floor( Math.random() * (max - min + 1) ) + min;
}

setInterval( () => {
    currentChromeProcessNum = 0;
    main()
    console.log('restore----------------------')
},600000 )

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
    await navigationPromise.catch(async ()=>{
        await browser.close()
        currentChromeProcessNum--;
        setTimeout( main, getrandom( 1000, 3000 ) );
    })
    await page.waitForSelector('#results',{timeout:0})
    await page.waitFor(1000)
    await doScroll(page)
    await checkApp(page)
    let  allItem=await page.$$eval('#results > div',el=>el.map(item=>item.innerText)),allTraget=await page.$$('#results > div');
    let idx=allItem.findIndex(item=>(item.includes('www.17huo.com') || item.includes('一起火') || item.includes('www.m.17huo.com')));
    if(idx<0){
        const nonext=await page.$$('#page-controller > .new-pagenav');
        if(nonext.length<1){
           await nextKey(page, navigationPromise, browser,dataIdx)
            return;
        }
        let nowPage=await page.$eval('#page-controller > .new-pagenav',el=>el.innerText),nextDiv=await page.$('#page-controller > .new-pagenav > div');
        console.log(nowPage,333333333333333);
        if(!nextDiv) {
            // console.log('pppppp1 ');
            await page.waitForSelector('#page-controller > .new-pagenav a');
            await  page.hover('#page-controller > .new-pagenav a')
            await page.waitFor(300)
            await page.tap('#page-controller > .new-pagenav a');
        } else if(nextDiv && !nowPage.includes('50')){
            await page.waitForSelector('#page-controller  .new-pagenav-right')
            if(!(await page.$('#page-controller  .new-pagenav-right a'))){
                await nextKey(page, navigationPromise, browser,dataIdx)
                return
            }
            await  page.hover('#page-controller  .new-pagenav-right a')
            await page.waitFor(300)
            await page.tap('#page-controller  .new-pagenav-right a');
        } else {
            await page.goto('http://m.17huo.com/', {timeout: 0} );
            addStr()
            await initmove(page, navigationPromise, browser,dataIdx)
            return;
        }
        // await navigationPromise
        await page.waitFor(500);
        await find17huo(page, navigationPromise, browser,dataIdx)
    }else{
        readfileAdd()
        readkeyAdd(dataIdx)
        await page.evaluate( () => {window.scrollTo(0,0)}).then(async ()=>{
            console.log(idx,11111111111,'tap after');
            await page.waitFor(800)
            allTraget[idx].tap()
            await page.waitFor( getrandom( 2000, 3000 ))
            await initmove(page, navigationPromise, browser,dataIdx)
        })

    }

}

async function initone(page, navigationPromise, browser,dataIdx){
    const tuijian=await page.$$('.des_tui a')
    if(tuijian.length>0){
        tuijian[getrandom(0,tuijian.length-1)].tap()
        await navigationPromise
        await page.waitFor(5000)
    }
    await browser.close();
    currentChromeProcessNum--;
        setTimeout(()=>{
            main()
        },2000)
}
async function checkApp(page){
    const showDiv=await page.$('#results .hint-fold-results-wrapper .ivk-button')
    if(showDiv){
        // console.log('checked','waiting')
        await page.waitForSelector('#results .hint-fold-results-wrapper .ivk-button')
        await page.hover('#results .hint-fold-results-wrapper .ivk-button')
        await page.waitFor(500)
        await showDiv.tap()
        await page.waitForSelector('#popupLead',{timeout:0})
        await page.tap('#popupLead .popup-lead-cancel')
    }
    console.log('checked','------')
}


async function nextKey(page, navigationPromise, browser,dataIdx){
    const dataIdxs=dataIdx+1;
    await page.goto('https://www.baidu.com/', {timeout: 0} );
    await page.waitForSelector('#index-kw');
    await page.focus('#index-kw').then(async ()=>{
        await page.keyboard.type(allData[dataIdxs].kw);
        await page.keyboard.down('Enter');
        await navigationPromise;
        await page.waitFor(1500)
        await otherOperation(page, navigationPromise, browser,dataIdxs)
    });
    // await browser.close();
    // currentChromeProcessNum--;
    // setTimeout( main, getrandom( 1000, 3000 ) );
}
async function tapTags(page, navigationPromise, browser,dataIdx){
    const tuijian=await page.$$('.des_tui a')
    if(tuijian.length>0){
        tuijian[getrandom(0,tuijian.length-1)].tap()
        await navigationPromise
        await page.waitFor(2000)
    }
}
function readfileAdd(){
    fs.readFile(`./num.json`,'utf8',async (err,data)=>{
        if(err)console.log(err,'dddddddddddddd');
        else {
            const allNum=JSON.parse(data);
          fs.writeFile(`${__dirname}/num.json`,JSON.stringify({pc:allNum.pc,mb:parseInt(allNum.mb)+1,lf:allNum.lf}),'utf8',(err)=>{
            if(err)console.log(err)
            else{
                console.log('addNum',parseInt(allNum.mb)+1)
            }
          })
        }
    })
}
function addStr(){
    fs.readFile(`./num.json`,'utf8',async (err,data)=>{
        if(err)console.log(err,'dddddddddddddd');
        else {
            const allNum=JSON.parse(data);
            fs.writeFile(`${__dirname}/num.json`,JSON.stringify({pc:allNum.pc,mb:allNum.mb,lf:parseInt(allNum.lf)+1}),'utf8',(err)=>{
                if(err)console.log(err)
                else{
                    console.log('addNum',parseInt(allNum.mb)+1)
                }
            })
        }
    })
}
function readkeyAdd(dataIdxs){
    fs.readFile(`./keywordsNum.json`,'utf8',async (err,data)=>{
        if(err)console.log(err,'aaaaaaaaaaa');
        else {
        // const url= (page.url()).includes('www') ? 'pc' : 'mb';
            let allNum=JSON.parse(data)
            if(allNum[allData[dataIdxs].kw])allNum[allData[dataIdxs].kw]=allNum[allData[dataIdxs].kw]+=1;
            else allNum[allData[dataIdxs].kw]=1;
            fs.writeFile(`${__dirname}/keywordsNum.json`,JSON.stringify( allNum),'utf8',(err)=>{
                if(err)console.log(err)
                else{
                    console.log('keyAdd',parseInt(allNum.mb)+1)
                }
            })
        }
    })
}
async function doScroll(page){
    console.log('moveing')
  await page.evaluate(() => {
      const scrollTop=document.documentElement.scrollHeight || document.body.scrollHeight,clintH=document.documentElement.clientHeight || document.body.clientHeight
       window.scrollBy(0,(scrollTop-clintH)/3)
       window.scrollBy(0,(scrollTop-clintH)/2)
       window.scrollBy(0,scrollTop-clintH)
    })
}
async function setTimer(browser){
    setTimeout(()=>{
        if(browser)browser.close()
    },600000)
}
