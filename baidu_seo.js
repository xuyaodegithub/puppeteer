const puppeteer = require('puppeteer'),fs = require('fs'),  nodeExcel = require('excel-export');;
async function test2() {
    const urls='http://seo.chinaz.com';
    const browser = await puppeteer.launch({executablePath:'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',headless:false,defaultViewport:{width:1920,height:1080},slowMo:50});
    const page = await browser.newPage();
    await page.goto(urls,{timeout:0});
    await page.focus('#q').then(async ()=>{
        await page.keyboard.type('www.picup.ai');
    });
    await page.click('input[type=submit]');
    await page.waitForSelector('#onekeyall',{timeout: 0});
    await page.click('#onekeyall');
    const timer=setInterval(async ()=>{
        const oLi=await page.$eval('#seov2kwsort > li:last-child > div:nth-child(7)',el =>  el.innerHTML);
        if(oLi.indexOf('img')<0) {
            clearInterval(timer)
            const oDiv=await page.$$eval('#seov2kwsort > li > div',el => el.map(el=>el.innerText));
            let config={},arrs=[],a=[];
            config.name='seo_Table';
            config.cols = [
                {caption: oDiv[0], type: 'string'},
                {caption: oDiv[1], type: 'string'},
                {caption: oDiv[2], type: 'string'},
                {caption: oDiv[3], type: 'string'},
                {caption: oDiv[4], type: 'string'},
                {caption: oDiv[5], type: 'string'},
                {caption: oDiv[6], type: 'string'}];
            oDiv.map((item,index)=>{
                if(a.length===7){
                    arrs.push(a)
                    a=[]
                } else a.push(item)
            })
            config.rows = arrs;
            const result = nodeExcel.execute(config);// fs将文件写到内存
            fs.writeFile(`${__dirname}/baidu_seo.xlsx`,result,'binary',async (err)=>{
                err ? console.log(err) : console.log('success')
                await browser.close()
            })
        }
    },2000)
   // await getDataList(page,navigationPromise,num,type,browser);
    // await browser.close()
}

test2()

//  exports.test=test2;
// module.exports=test2;
