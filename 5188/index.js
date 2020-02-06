let puppeteer = require( 'puppeteer' ), http = require( 'http' ), path = require( 'path' ), fs = require( 'fs' ),
    utils = require( '../utils/index' ),allData,allLength,dataIdx=0;
let maxChromeProcessNum =2;
var currentChromeProcessNum = 0,linkNum=0,allPage=[],allItem;
readfile()

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
    if (currentChromeProcessNum < maxChromeProcessNum) {
        currentChromeProcessNum++;
        var options = {
            host: "dps.kdlapi.com",
            port: 80,
            path: "/api/getdps/?orderid=977914332984052&num=1&pt=2&sep=4"
            // http://xushengjing:kb0q85gz@ip:端口/
        };
        http.get( options, function (res) {
            res.on( 'data', function (data) {
                console.log( "proxy:" + data );
                init( data );
            } ).on( 'end', function () {

            } );
        } );
        var staySenconds = Math.floor( (Math.random() * 60) ) + 30;
        setTimeout( main, staySenconds * 1000 );
    }
}

async function init(proxy) {
    let userid = Math.floor( (Math.random() * 1000) );
    // console.log(__dirname)
    let userDir = `D:/新建文件夹/userIp/${userid}/`;
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
        userDataDir: userDir
    } )
    // console.log(browserArgs)
    let page = await browser.newPage();
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
    await page.focus('#kw').then(async ()=>{
        await page.keyboard.type(allData[dataIdx]);
    });
    await page.click('#su');
    await navigationPromise;
    await otherOperation(page, navigationPromise, browser)
}

async function otherOperation(page, navigationPromise, browser) {
    // await page.waitFor( getrandom( 2000, 5000 ) )
    await page.waitForSelector('#content_left',{timeout: 0});
    allPage=await page.$$('.pagination li a')
    console.log('findindex')
        await find17huo(page, navigationPromise, browser)

}


async function initmove(page, navigationPromise, browser,newPage2) {
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
            }, Math.floor((Math.random()*4000))+2000 )//Math.floor((Math.random()*5000))+3000
        } )

    } )
    scrollTimer2.then( async () => {
        await newPage2.waitFor(getrandom( 2000, 5000 ) );
        await newPage2.close();
        await initone(page, navigationPromise, browser)
        // linkNum+=1;
        // await initFive(page, navigationPromise, browser)
    } )
}

function getrandom(min, max) {
    return Math.floor( Math.random() * (max - min + 1) ) + min;
}

setInterval( () => {
    currentChromeProcessNum = 10
    setTimeout( () => {
        currentChromeProcessNum = 0
        console.log('restore----------------------')
        main()
    }, 300000 )
}, 7200000 )

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
async function find17huo(page, navigationPromise, browser){
    allItem=await page.$$eval('#content_left > div',el=>el.map(item=>item.innerText));
    let idx=allItem.findIndex(item=>(item.includes('www.17huo.com') || item.includes('一起火') ));
    if(idx<0){
        let nowPage=await page.$eval('#page > strong span:last-child',el=>el.innerText);
        // let pageA=await newPage.$$eval('#page > a',el => el.map(el=>el.innerText));//获取需要点击的页数
        // let pageIdx=pageA.indexOf(String(+nowPage+1))//获取需要点击的页数位置
        console.log(+nowPage+1,333333333333333);
        if(+nowPage>1)nowPage=+nowPage+1;
        await page.click(`#page a:nth-child(${+nowPage+1})`);
        // await page.waitFor(500);
        let timer=setInterval(async ()=>{
            const otext=await page.$eval('#page strong ',el=> el.innerText);
            if((+nowPage==1 && otext==+nowPage+1) || (+nowPage!=1 && otext==nowPage)){
                clearInterval(timer)
                await find17huo(page, navigationPromise, browser)
            }
        },200)
    }else{
        // let twoPage=await page.$$(`#content_left .c-container .t a`);
        let newPagePromise2 = new Promise( x => browser.once( 'targetcreated', target => x( target.page() ) ) );    // 声明变量
        await page.evaluate( () => {window.scrollTo(0,0)}).then(async ()=>{
            console.log(allItem[idx],idx,11111111111,'click after');
            await page.click(`#content_left > div:nth-child(${idx+1}) .t a`)
            // await twoPage[idx].click();
            let newPage2 = await newPagePromise2;// 点击跳转
            // await newPage2.waitForNavigation( {timeout: 0} )
            await noImage(newPage2)
            await newPage2.waitFor( getrandom( 2000, 3000 ))
            await initmove(page, navigationPromise, browser,newPage2)
        })

    }

}

async function initone(page, navigationPromise, browser){
    if(dataIdx>=allLength)dataIdx=0;
    if(dataIdx % 5 ===0 && dataIdx !==0){
        currentChromeProcessNum--
        await browser.close()
        setTimeout(()=>{
            main()
        },2000)
    }else {
        dataIdx++;
        await page.focus('#kw').then(async ()=>{
            await page.keyboard.down('Control');
            await page.keyboard.press('KeyA');
            await page.keyboard.up('Control');
            await page.keyboard.press('Delete');
            await page.keyboard.type(allData[dataIdx]);
        });
        await page.click('#su');
        await navigationPromise;
        await page.waitFor(1500)
        await otherOperation(page, navigationPromise, browser)
    }


}
