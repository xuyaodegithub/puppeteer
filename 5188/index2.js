let puppeteer = require( 'puppeteer' ), http = require( 'http' ), path = require( 'path' ), fs = require( 'fs' ),
   allData,allLength;
let maxChromeProcessNum =4;
var currentChromeProcessNum = 0;
readfile()

async function readfile(){
    fs.readFile(`./dataArr0.json`,'utf8',async (err,data)=>{
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
    var dataIdx=getrandom(0,100);
    if (currentChromeProcessNum < maxChromeProcessNum) {
        currentChromeProcessNum++;
        var options = {
            host: "dps.kdlapi.com",
            port: 80,
	//path: "/api/getdps/?orderid=978392088801261&num=1&pt=2&sep=4"//1w
            path: "/api/getdps/?orderid=988330455178145&num=1&pt=2&sep=4"//3000
            // path: "/api/getdps/?orderid=988184771100214&num=1&pt=2&sep=4"
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
    let userid = Math.floor( (Math.random() * 5000) );
    // console.log(__dirname)
    let userDir = `D:/新建文件夹/userIp/${userid}/`;
    let browserArgs = [
        "--proxy-server=socks5://" + proxy,
        // "--proxy-server=http://xushengjing:kb0q85gz@"+proxy+'/',
        "--no-sandbox",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
    ];
    let browser = await puppeteer.launch( {
        // headless: false,
        defaultViewport: {width: 1920, height: 1080},
        slowMo: 50,
        args: browserArgs,
        userDataDir: userDir
    } )
    setTimer(browser)
    // console.log(browserArgs)
    let page = await browser.newPage();
    // setTimer(page, browser,)
    let navigationPromise = page.waitForNavigation( {timeout: 0} )
    await page.on( 'error', async () => {
        await browser.close();
        currentChromeProcessNum--;
        setTimeout( main, getrandom( 1000, 3000 ) );
    } )
    await page.goto( 'https://www.baidu.com/', {timeout: 0} );
    await page.on( 'pageerror', async () => {
        await browser.close();
        currentChromeProcessNum--;
        setTimeout( main, getrandom( 1000, 3000 ) );
    } )
    // await page.on( 'disconnected', async () => {
    //     await browser.close();
    //     currentChromeProcessNum--;
    //     setTimeout( main, getrandom( 1000, 3000 ) );
    // } )
    await page.focus('#kw').then(async ()=>{
        await page.keyboard.type(allData[dataIdx].kw);
    });
    await page.click('#su');
    await navigationPromise;
    await otherOperation(page, navigationPromise, browser,dataIdx)
}

async function otherOperation(page, navigationPromise, browser,dataIdx) {
    // await page.waitFor( getrandom( 2000, 5000 ) )
    let doscall = doScroll(page)
    doscall.then(async()=>{
        await page.waitForSelector('#content_left',{timeout: 0});
        // allPage=await page.$$('.pagination li a')
        console.log('findindex')
        await find17huo(page, navigationPromise, browser,dataIdx)
    })
}


async function initmove(page, navigationPromise, browser,newPage2,dataIdx) {
    const oClose=await newPage2.$('#bomb_close')
    if(oClose){
        console.log('close')
        await newPage2.click('#bomb_close')
        console.log()
    }
    console.log('close3')
    await newPage2.waitFor( getrandom( 2000, 5000 ) );
    var scrollTimer2 = newPage2.evaluate( () => {
        return new Promise( (resolve, reject) => {
            var totalHeight = 0;
            // var distance = 50;
            var timer = setInterval( () => {
                let distance = Math.floor( Math.random() * (200 - 30 + 1) ) + 30;
                window.scrollBy( 0, distance );
                totalHeight += distance;
                if (totalHeight >= (document.body.scrollHeight-document.documentElement.clientHeight)) {
                    // window.scrollTo(0, 500)
                    clearInterval( timer )
                    resolve()
                }
            }, Math.floor((Math.random()*2500))+1000)//Math.floor((Math.random()*5000))+3000
        } )

    } )
    scrollTimer2.then( async () => {
        console.log('close4')
        await newPage2.waitFor(getrandom( 2000, 5000 ) );
        const link = await newPage2.$$( '.footer_rp_flk .fl a' );
        // const idx=parseInt(Math.random()*link.length)
        const newPagePromise = new Promise( x => browser.once( 'targetcreated', target => x( target.page() ) ) );    // 声明变量
        await link[getrandom( 0, link.length - 1 )].click();                             // 点击跳转
        const newPage = await newPagePromise;
        await newPage.waitFor( 10000);
        await newPage.close();
        await newPage2.close();
        await initone(page, navigationPromise, browser,dataIdx)
        // linkNum+=1;
        // await initFive(page, navigationPromise, browser)
    } )
}

function getrandom(min, max) {
    return Math.floor( Math.random() * (max - min + 1) ) + min;
}

setInterval( () => {
    // currentChromeProcessNum = 10
    // setTimeout( () => {
        currentChromeProcessNum = 0;
        console.log('restore----------------------')
        main()
    // }, 300000 )
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
    // let doscall = doScroll(page)
  let  allItem=await page.$$eval('#content_left > div',el=>el.map(item=>item.innerText));
    let idx=allItem.findIndex(item=>(item.includes('www.17huo.com') || item.includes('一起火') ));
    if(idx<0){
        let nowPage=await page.$eval('#page > strong span:last-child',el=>el.innerText);
        console.log(+nowPage+1,333333333333333);
        // if(+nowPage>1)nowPage=+nowPage+1;
        if(+nowPage>50){
            await page.close();
            await browser.close();
            setTimeout(main,2000);
            return;
        }
        await page.waitFor(500);
        await page.click(`#page > a:last-child`);
        // await page.waitFor(500);
        let timer=setInterval(async ()=>{
            const otext=await page.$eval('#page strong ',el=> el.innerText);
            console.log(+nowPage+1,otext)
            if(+nowPage+1==otext){
                clearInterval(timer)
                await find17huo(page, navigationPromise, browser,dataIdx)
            }
        },2000)
    }else{
        // let twoPage=await page.$$(`#content_left .c-container .t a`);
        readfileAdd()
        let newPagePromise2 = new Promise( x => browser.once( 'targetcreated', target => x( target.page() ) ) );    // 声明变量
        await page.evaluate( () => {window.scrollTo(0,0)}).then(async ()=>{
            console.log(idx,11111111111,'click after');
            await page.waitFor(800)
            await page.click(`#content_left > div:nth-child(${idx+1}) .t a`)
            // await twoPage[idx].click();
            let newPage2 = await newPagePromise2;// 点击跳转
            // await newPage2.waitForNavigation( {timeout: 0} )
            await noImage(newPage2)
            await newPage2.waitFor( getrandom( 2000, 3000 ))
            await initmove(page, navigationPromise, browser,newPage2,dataIdx)
        })

    }

}

async function initone(page, navigationPromise, browser,dataIdx){
    // let dataIdxs=dataIdx;
    // if(dataIdxs>=allLength-1)dataIdxs=0;
    // if(dataIdxs % 2 ===0 && dataIdxs !==0){
        await browser.close();
    currentChromeProcessNum--;
    setTimeout(()=>{
            main()
        },2000)
    // }else {

    // }


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
            }, 300)
        })
    })
    return scrollTimer
}
function readfileAdd(){
    fs.readFile(`./num.json`,'utf8',async (err,data)=>{
        if(err)console.log(err,'dddddddddddddd');
        else {
            const allNum=JSON.parse(data);
            fs.writeFile(`${__dirname}/num.json`,JSON.stringify({pc:parseInt(allNum.pc)+1,mb:allNum.mb,lf:allNum.lf}),'utf8',(err)=>{
                if(err)console.log(err)
                else{
                    console.log('addNum',parseInt(allNum.pc)+1)
                }
            })
        }
    })
}
async function setTimer(browser){
    setTimeout(()=>{
        if(browser)browser.close()
    },600000)
}
