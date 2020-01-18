const puppeteer = require('puppeteer'),fs = require('fs'),  nodeExcel = require('excel-export');
let config={},typeIdx=23,allUrl=[],allPage=0,allData=[],pageidx=1673,typeName='',typeUrl='';
async function test2() {
    const urls='https://www.eelly.com/index.php?app=ciku&act=letter&c=x&page=1674';
    const browser = await puppeteer.launch({executablePath:'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',headless:false,defaultViewport:{width:1920,height:1080},slowMo:50});
    const page = await browser.newPage();
    await page.goto(urls,{timeout:0});
    const navigationPromise = page.waitForNavigation({timeout:0});
    await page.waitForSelector('.nav_content .menu',{timeout: 0})
    allUrl=await page.$$eval('.nav_content .menu li a',el=>el.map(e=>e.href))
    const i=(await page.$$eval('.nav_content .menu li a',el=>el.map(e=>e.outerHTML))).findIndex(el=>el.includes('active'))
    typeName=await page.$eval(`.nav_content .menu li:nth-child(${i+1}) a`,el=>el.innerText)
    await page.waitForSelector('.words_page .first a:first-child',{timeout: 0})
    typeUrl='https://www.eelly.com/index.php?app=ciku&act=letter&c=x'
    // typeUrl=await page.$eval(`.words_page .first a:first-child`,el=>el.href)
    // allPage=await page.$eval('#pager a:last-child',el=>(el.innerText).substr(1,el.innerText.length-2))
    // console.log(allPage)
  await pill(page,navigationPromise)
}

async  function getData(page,navigationPromise){
    console.log(333)
    // await  page.waitForSelector('.nav_content .content',{timeout: 0})
    const data=[++pageidx,...await page.$$eval('.nav_content .content li a',el=>el.map(els=>els.innerText))]
    console.log(444)
    fs.appendFile(`./${typeName}.json`,JSON.stringify(`${data},`),'utf8',async (err)=>{
        if(err) console.log(err);
        else {
            console.log(pageidx,'success')
            await page.goto(typeUrl+`&page=${pageidx+1}`,{timeout:0});
            await pill(page,navigationPromise)
        }
    })
    // console.log(111)
}

async function pill(page,navigationPromise){
    // await  page.waitForSelector('.words_page',{timeout: 0})
    console.log(111)
    let alla=await page.$$('.nav_content .content li');
    console.log(alla.length)
    if(alla.length<1){
                console.log(typeName,'success')
                allData=[];
                typeName='';
                typeUrl='';
                pageidx=0;
                if(typeIdx===allUrl.length-1)return;
                else {
                    typeIdx++
                    await page.goto(allUrl[typeIdx],{timeout:0});
                    const i=(await page.$$eval('.nav_content .menu li a',el=>el.map(e=>e.outerHTML))).findIndex(el=>el.includes('active'))
                    typeName=await page.$eval(`.nav_content .menu li:nth-child(${i+1}) a`,el=>el.innerText)
                    // await page.waitForSelector('.words_page .first a:first-child',{timeout: 0})
                    typeUrl=await page.$eval(`.words_page .first a:first-child`,el=>el.href)
                    // allPage=await page.$eval('#pager a:last-child',el=>(el.innerText).substr(1,el.innerText.length-2))
                    await pill(page,navigationPromise)
                }
    }else {
        await getData(page,navigationPromise)
    }
}
test2()
//  exports.test=test2;
// module.exports=test2;
