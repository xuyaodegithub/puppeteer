const puppeteer = require('puppeteer'),fs = require('fs'),  nodeExcel = require('excel-export');
let config={},page=1,seachUrl='www.17huo.com';
async function test2() {
    const urls='https://account.5118.com/account/login';
    const browser = await puppeteer.launch({executablePath:'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',headless:false,defaultViewport:{width:1920,height:1080},slowMo:50});
    const page = await browser.newPage();
    await page.goto(urls,{timeout:0});
    const navigationPromise = page.waitForNavigation({timeout:0});
    // await page.waitForSelector('.account-wrap a',{timeout: 0})
    // await page.click('.account-wrap a');
    // await navigationPromise
    await page.waitForSelector('.rightpng a')
    await page.click('.rightpng a');
    await page.waitForSelector('.login-box input:nth-child(2)')
    await page.focus('.login-box input:first-child').then(async ()=>{
        await page.keyboard.type('16605813146');
    });
    await page.focus('.login-box input:nth-child(2)').then(async ()=>{
        await page.keyboard.type('xuyaode85731');
    });
    await page.click('.login-box button');
    await navigationPromise
    await page.waitForSelector('._5118-navigation',{timeout:0})
    await page.click('#navs li:first-child a');
    await navigationPromise
    await page.waitForSelector('.flex-box .item:first-child .group:nth-child(3) input')
    await page.focus('.flex-box .item:first-child .group:nth-child(3) input').then(async ()=>{
        await page.keyboard.type('www.17huo.com');
        // await page.keyboard.down('Enter')
        // await page.keyboard.up('Enter')
    });
    await page.goto(`https://www.5118.com/seo/baidupc/${seachUrl}`,{timeout:0})
    await page.waitForSelector('table.list-table',{timeout:0})
    const oHrader=await page.$$eval('.list-header tr td',el=>el.map(el=>el.innerText))
    config.name='seo_Table'
    config.cols=[
        {caption: oHrader[0], type: 'string'},
        {caption: oHrader[1], type: 'string'},
        {caption: oHrader[2], type: 'string'},
        {caption: oHrader[4], type: 'string'},
        {caption: oHrader[5], type: 'string'},
        {caption: oHrader[6], type: 'string'}
    ]
    config.rows=[]
  await getData(page,navigationPromise)
}

async  function getData(page,navigationPromise){
   const allpage=await page.$$('.pagination li a')
    await page.waitForSelector('.list-table',{timeout:0})
    const oTr=await page.$$('.list-body tr');
    for(let i=0;i<oTr.length;i++){
        const arr= await oTr[i].$$eval('td',el=>el.map(els=>els.innerText))
        config.rows.push([arr[0],arr[1],arr[2],arr[4],arr[5],arr[6]])
    }
    const oPageNum=await page.$eval('.pagination li a.active',el=>(Number(el.innerText)+1))
    const acPage=(await page.$$eval('.pagination li a',el=>el.map(el=>el.innerText))).findIndex(item=>item==oPageNum)
    if(acPage>-1){
        await allpage[acPage].click()
        await pill(page,navigationPromise)
        }else{
            const result = nodeExcel.execute(config);// fs将文件写到内存
            fs.writeFile(`${__dirname}/5118_seo.xlsx`,result,'binary',async (err)=>{
                err ? console.log(err) : console.log('success')
                // await browser.close()
            })
        }
}

async function pill(page,navigationPromise){
    const oData=await page.$('.list-body tr:last-child')
    const one=await oData.$eval('td',el=>el.innerText)
    const lase=await oData.$eval('td:nth-child(6)',el=>el.innerText)
    if(one!==config.rows[config.rows.length-1][0] && lase!==config.rows[config.rows.length-1][5] )await getData(page,navigationPromise)
    else await pill(page,navigationPromise)

}
test2()
//  exports.test=test2;
// module.exports=test2;
