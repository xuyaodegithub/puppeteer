const puppeteer = require('puppeteer'),fs = require('fs'),  nodeExcel = require('excel-export');
let config={},allkeys=[29,30,33,41,47,53],oneList=[],twoList=[],threeList=[],oidx=0,tidx=0,thidx=0,swichs=1,fourTable=['rise','hot','conversion','new'],tabIdx=0;
async function test2() {
    const urls='http://index.1688.com/alizs/keyword.htm?userType=purchaser&cat=10166,201158403,201156902';
    const browser = await puppeteer.launch({executablePath:'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',headless:false,defaultViewport:{width:1920,height:1080},slowMo:50});
    const page = await browser.newPage();
    await page.goto(urls,{timeout:0});
    const navigationPromise = page.waitForNavigation({timeout:0});
    await page.waitForSelector('.cate-selectors',{timeout: 0});
    await page.hover('.cate-select:first-child');
    await page.waitForSelector('.cate-select:first-child .drop-list');
    oneList=(await page.$$eval('.cate-select:first-child .drop-list a',el=>el.map(e=>e.getAttribute('data-key')))).filter((item,idx)=>allkeys.includes(idx));
    console.log(oneList)
    await getData(page,navigationPromise)
}

async  function getData(page,navigationPromise){
    await page.goto(`http://index.1688.com/alizs/keyword.htm?userType=purchaser&cat=${oneList[oidx]}`,{timeout:0});
    await page.waitForSelector('.cate-selectors',{timeout: 0});
    // const disables=(await page.$eval('.cate-select:nth-child(2)',el=>el.getAttribute('class'))).includes('grey-cate-select');
    // console.log(await page.$eval('.cate-select:nth-child(2)',el=>el.getAttribute('class')),disables)
    await page.hover('.cate-select:nth-child(2)');
    await page.waitForSelector('.cate-select:nth-child(2) .drop-list');
    await saveData(page,navigationPromise,7)
    // await saveData(page,navigationPromise,'hot')
    // await saveData(page,navigationPromise,'conversion')
    // await saveData(page,navigationPromise,'new')
}

async function saveData(page,navigationPromise,k){
    const keyWords=await page.$$eval('.cate-selectors .cate-select .current a',el=>el.map(ele=>ele.innerText));
    let oneTable=await page.$$eval(`.${fourTable[tabIdx]} .list .keyword`,el=>el.map(e=>e.innerText));
    let idx=parseInt(await page.$eval(`.${fourTable[tabIdx]} .pagination .current`,el=>el.innerText)),lastIdx=parseInt(await page.$eval(`.${fourTable[tabIdx]} .pagination .last`,el=>el.innerText));
    while (idx<lastIdx){
            idx+=1;
        await page.click(`.${fourTable[tabIdx]} .pagination .page:nth-child(${idx})`);
        await page.waitFor(300)
        oneTable=[...oneTable,...(await page.$$eval(`.${fourTable[tabIdx]} .list .keyword`,el=>el.map(e=>e.innerText)))]
    }
    fs.appendFile(`./1688.txt`,`---${keyWords.join('-')}---最近${k}天---${setTitle(tabIdx)}---，${oneTable.join(',')}`,'utf8',async (err)=>{
        if(err) console.log(err);
        else {
            console.log(fourTable[tabIdx],'-----success')
            if(tabIdx<3){
                tabIdx+=1;
                await saveData(page,navigationPromise,k);
            }else{
                tabIdx=0;
                if(swichs===1){
                    swichs=2;
                    await page.click('.paras .radio:last-child')
                    await navigationPromise;
                    console.log(222222222222)
                    await saveData(page,navigationPromise,30)
                }else{
                    swichs=1;
                    const disables=(await page.$eval('.cate-select:nth-child(3)',el=>el.getAttribute('class'))).includes('grey-cate-select');
                    if(!disables){
                        await page.hover('.cate-select:nth-child(3)');
                        await page.waitForSelector('.cate-select:nth-child(3) .drop-list');
                        threeList=(await page.$$eval('.cate-select:nth-child(3) .drop-list a',el=>el.map(ele=>ele.getAttribute('data-key'))));
                    }else{
                        const disables2=(await page.$eval('.cate-select:nth-child(2)',el=>el.getAttribute('class'))).includes('grey-cate-select');
                        if(!disables2){
                            await page.hover('.cate-select:nth-child(2)');
                            await page.waitForSelector('.cate-select:nth-child(2) .drop-list');
                            twoList=(await page.$$eval('.cate-select:nth-child(2) .drop-list a',el=>el.map(ele=>ele.getAttribute('data-key'))));
                        }
                    }
                    if(threeList.length>0 && thidx<threeList.length-1){
                        await page.goto(`http://index.1688.com/alizs/keyword.htm?userType=purchaser&cat=${oneList[oidx]},${twoList[tidx]},${threeList[thidx]}`,{timeout:0});
                        thidx++
                    }else if(twoList.length>0 && tidx<twoList.length-1){
                        thidx=0;
                        await page.goto(`http://index.1688.com/alizs/keyword.htm?userType=purchaser&cat=${oneList[oidx]},${twoList[tidx]}`,{timeout:0});
                        tidx++
                    }else if(oidx<oneList.length-1){
                        tidx=0;
                        thidx=0;
                        oidx+=1;
                        await page.goto(`http://index.1688.com/alizs/keyword.htm?userType=purchaser&cat=${oneList[oidx]}`,{timeout:0});
                    }
                    await saveData(page,navigationPromise,7)
                }
            }
        }
    })
}
function setTitle(){
    if(tabIdx===0)return '上升榜';
    else if(tabIdx===1) return '热搜榜';
    else if(tabIdx===2) return '转化率榜';
    else if(tabIdx===3) return '新词榜';
}
test2()
//  exports.test=test2;
// module.exports=test2;
