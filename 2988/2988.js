const puppeteer = require('puppeteer'),fs = require('fs'),  nodeExcel = require('excel-export');
let config={},typeIdx=1,allUrl=[],pageidx=364,typeName='',typeUrl='';
async function test2() {
    const urls='https://www.2298.com/wd_B_p365.html';
    const browser = await puppeteer.launch({executablePath:'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',headless:false,defaultViewport:{width:1920,height:1080},slowMo:50});
    const page = await browser.newPage();
    await page.goto(urls,{timeout:0});
    const navigationPromise = page.waitForNavigation({timeout:0});
    await page.waitForSelector('#IndexTr',{timeout: 0})
    allUrl=await page.$$eval('#IndexTr a',el=>el.map(e=>e.href))
    const i=(await page.$$eval('#IndexTr a',el=>el.map(e=>e.outerHTML))).findIndex(el=>el.includes('currt'))
    typeName=await page.$eval(`#IndexTr td:nth-child(${i+1}) a`,el=>el.innerText)
    typeUrl=allUrl[typeIdx].split('_p')[0]
  await pill(page,navigationPromise)
}

async  function getData(page,navigationPromise){
   const allData=[++pageidx,...await page.$$eval('#divSiteMap li a',el=>el.map(el=>el.innerText))]
    fs.appendFile(`./${typeName}.txt`,JSON.stringify(`${allData},`),'utf8',async (err)=>{
        if(err) console.log(err);
        else {
            console.log(pageidx,'success')
            try {
                await page.goto(typeUrl+`_p${pageidx+1}.html`,{timeout:0});
                await pill(page,navigationPromise)
            }
            catch (e) {
                await page.goto(typeUrl+`_p${pageidx+1}.html`,{timeout:0});
                await pill(page,navigationPromise)
            }

        }
    })
}

async function pill(page,navigationPromise){
    let alla=await page.$$('#divSiteMap li a');
    if(alla.length<1){
                console.log(typeName,'success')
                pageidx=0;
                typeName='';
                if(typeIdx===allUrl.length-1)return;
                else {
                    typeIdx++
                    await page.goto(allUrl[typeIdx],{timeout:0});
                    const i=(await page.$$eval('#IndexTr a',el=>el.map(e=>e.outerHTML))).findIndex(el=>el.includes('currt'))
                    typeName=await page.$eval(`#IndexTr td:nth-child(${i+1}) a`,el=>el.innerText)
                    typeUrl=allUrl[typeIdx].split('_p')[0]
                    await getData(page,navigationPromise)
                }
        return;
    }else await getData(page,navigationPromise)
}
test2()
//  exports.test=test2;
// module.exports=test2;
