const puppeteer = require('puppeteer'),fs = require('fs');
var allData=[],type=20,allPage=1,allTypeUrl=[];
async function test2() {
    const urls='https://pixabay.com/images/search';
    const browserArgs = [
        "--proxy-server=socks5://"+'192.168.0.128',
        "--no-sandbox",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
    ];
    const browser = await puppeteer.launch({executablePath:'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',headless:false,defaultViewport:{width:1920,height:1080},slowMo:50,args:browserArgs})//
    const page = await browser.newPage();
     const navigationPromise = page.waitForNavigation({timeout:0,waitUntil:'networkidle0'});
    // await page.setRequestInterception(true);
    // page.on('request', interceptedRequest => {
    //     if (interceptedRequest.url().endsWith('.png') || interceptedRequest.url().endsWith('.jpg'))
    //         interceptedRequest.abort();
    //     else
    //         interceptedRequest.continue();
    // });
    await page.goto(urls,{timeout:0});
    await page.on('error',err=>{
        fs.writeFile(`${__dirname}/dataJson/data${type}.json`,JSON.stringify(allData),async err=>{
            if(err) console.log(err)
            else console.log('奔溃后保存success')
        })
    })
    await page.waitForSelector('.media_filter',{timeout: 0});
    await page.click('.media_filter .menu:nth-child(7)');
    await page.waitForSelector('#cat_filter',{timeout: 0,visible:true});
    allTypeUrl=await page.$$eval(`#cat_filter > a`,el=>el.map(v=>v.href));
    await cilcBtn(page,browser,navigationPromise)
}
async function  getDataList(page,browser,navigationPromise){
    const pageNum=await page.$eval('#paginator_clone input[name=pagi]',el=>el.value)
    const arr=await page.$$eval('.search_results > div > a > img',(el,pageNum)=>el.map(v=> {
        return{name:v.alt,page:pageNum,src:v.outerHTML.indexOf('data-lazy') > -1 ? v.outerHTML.split('data-lazy="')[1].split('"')[0].replace('__340','_960_720') : v.src.replace('__340','_960_720')}
    }),pageNum)
    allData=[...allData,...arr];
    if(pageNum==allPage){
        fs.writeFile(`${__dirname}/dataJson/data${type}.json`,JSON.stringify(allData),async err=>{
            if(err) console.log(err)
            else {
                console.log('success')
                if(type===21) console.log(21)//await browser.close()
                else {
                    type+=1;
                    allData=[];
                    await cilcBtn(page,browser,navigationPromise)
                }
            }
        })
        return
    }
    console.log(pageNum,allPage,'pppppppppppp')
    const url=await page.$eval('.media_list > .pure-button',el=>el.href)
    await page.goto(url,{timeout:0});
    await getDataList(page,browser,navigationPromise)
}

async function cilcBtn(page,browser,navigationPromise){
    if([5,6,7,8,9].includes(type)){
        type=10;
        allData=[];
    }
    await page.goto(allTypeUrl[type-1],{timeout:0});
    console.log(allTypeUrl[type-1],'___________')
    allPage=(await page.$eval('#paginator_clone form',el=>el.innerText)).replace(/\D/g,'')
    await getDataList(page,browser,navigationPromise)
}


test2()
