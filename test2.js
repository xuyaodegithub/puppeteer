const puppeteer = require('puppeteer'),cluster = require('cluster'),fs = require('fs'), nodeExcel = require('excel-export'),conf={}, cheerio = require('cheerio'),dataList=[];
const devices = require('puppeteer/DeviceDescriptors');
var pageNum=1;
async function test2(type=1,Keyword='杭州代发',num=10) {
    const strs=type== 1 ? '#kw' : type== 2 ? '#input' : type==3 ? '#query' : '#kw';
    const seachBtn=type== 1 ? '#su' : type== 2 ? '#search-button' : type==3 ? '#stb' : '.submit';
    const urls=type== 1 ? 'https://www.baidu.com/' : type==2 ? 'https://www.so.com/' : type==3 ? 'https://www.sogou.com/' : 'https://m.sm.cn/' ;  //1百度  2是360  3搜狗  4神马
    const iPhone = devices['iPhone 6'];

    conf.name='hzfaifa';
    conf.cols = [{caption: '名称', type: 'string'}, {caption: '网址', type: 'string'}, {caption: '类别', type: 'string'}];
    const browser = await puppeteer.launch({executablePath:'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',headless:false,defaultViewport:{width:1920,height:1080},slowMo:50})
    const page = await browser.newPage()
    if(type==4) await page.emulate(iPhone);
     const navigationPromise = page.waitForNavigation({timeout:0,waitUntil:'networkidle0'});
    // await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(urls,{timeout:0});
    await page.focus(strs).then(async ()=>{
        await page.keyboard.type(Keyword);
    });
    await page.click(seachBtn);
    await navigationPromise;
    if(type==1)await getDataList(page,navigationPromise,num,type,browser);
    else if ( type==2 )await get360DataList(page,navigationPromise,num,type);
    else if(type==3) await getsogouDataList(page,navigationPromise,num,type);
    else await getsmDataList(page,navigationPromise,num,type);

    // await browser.close()
}
async function  getDataList(page,navigationPromise,num,type,browser){//百度
    console.log(pageNum,dataList.length)
    dataList.push([String(pageNum),'',''])
    await page.waitForSelector('#content_left',{timeout: 0})

    await otherOperation(page,navigationPromise,num,type,browser)


}





async function  getsogouDataList(page,navigationPromise,num,type){//sogou
    console.log(pageNum,dataList.length)
    dataList.push([String(pageNum),'',''])
    await page.waitForSelector('#main',{timeout: 0})
    await page.waitForSelector('#pagebar_container',{timeout: 0})
    await page.content().then( async body=>{
        const $=cheerio.load(body)
        const oDiv=$('#main > div');//
        const rows=$('#pagebar_container').children();
        oDiv.map(function(i,e){
            if($(this).hasClass('sponsored')){
                const sonDivText=$(this).find('.biz_rb ')
                sonDivText.map(function(i,e){
                    dataList.push([ $(this).find('.biz_title a').eq(0).text(),$(this).find('.biz_fb').eq(0).text(),'广告'])
                })
            }else if(!$(this).attr('class')){
                    const sonDiv=$(this).find('.results > div')
                    sonDiv.map(function(i,t){
                        if( $(this).html().indexOf('vrTitle')>-1)dataList.push([$(this).find('h3').eq(0).text(),$(this).find('.fb cite').eq(0).text(),'非广告'])
                        else dataList.push([$(this).find('.pt a').eq(0).text(),$(this).find('.fb cite').eq(0).text(),'非广告'])
                    })
            }
        })
        if(pageNum>=num){
            createExcel(type)
            return
        }
        let iss=await getWhichPage(rows,$)
        await page.click(`#pagebar_container a:nth-child(${iss+1})`)
        const timer=setInterval(async ()=>{
            const otext=await page.$eval('#pagebar_container span',el=> el.innerText)
            if(otext==(pageNum+1)){
                clearInterval(timer)
                pageNum+=1;
                await getsogouDataList(page,navigationPromise,num,type)
            }
        },200)
    })
}

async function  get360DataList(page,navigationPromise,num,type){//360
    console.log(pageNum,dataList.length,type)
    dataList.push([String(pageNum),'',''])
    await page.waitForSelector('#main',{timeout: 0})
    await page.waitForSelector('#page',{timeout: 0})
    await page.content().then( async body=>{
        const $=cheerio.load(body)
        const oDiv=$('#main').children();//
        const rows=$('#page').children();
        oDiv.map(function(i,e){
            if($(this).hasClass('e-buss') && !$(this).attr('id')!="m-spread-bottom"){
                const sonDivText=$(this).children('ul').children('li')
                sonDivText.map(function(i,e){
                    if(!$(this).attr('class') && !$(this).attr('id')) dataList.push([ $(this).find('.e_haosou_fw_bg_title').eq(0).text(),$(this).find('.e_haoso_fengwu_extend').eq(0).text(),'广告']);
                    else dataList.push([ $(this).find('h3').eq(0).text(),$(this).find('cite').eq(0).text(),'非广告'])
                })
            }else if($(this).hasClass('result')){
                const sonDiv=$(this).find('.res-list')
                sonDiv.map(function(i,t){
                     dataList.push([$(this).find('.res-title').eq(0).text(),$(this).find('.res-linkinfo').eq(0).text(),'非广告'])
                })
            }
            if($(this).attr('id')=="m-spread-bottom") {
                const oDiv=$(this).find('ul li')
                oDiv.map(function(val,index){
                    dataList.push([ $(this).find('.e_haosou_fw_bg_title').eq(0).text(),$(this).find('cite').eq(0).text(),'广告'])
                })

            }
        })
        if(pageNum>=num){
            createExcel(type)
            return
        }
        let iss=await getWhichPage(rows,$)
        await page.click(`#page a:nth-child(${iss+1})`)
        const timer=setInterval(async ()=>{
            const otext=await page.$eval('#page strong',el=> el.innerText)
            if(otext==(pageNum+1)){
                clearInterval(timer)
                pageNum+=1;
                await get360DataList(page,navigationPromise,num,type)
            }
        },200)
    })
}


async function  getsmDataList(page,navigationPromise,num,type){//神马
    console.log(pageNum,dataList.length,type)
    dataList.push([String(pageNum),'',''])
    await page.waitForSelector('#results',{timeout: 0})
    await page.waitForSelector('#pager',{timeout: 0})
    await page.click(`#pager`)
    await navigationPromise
    const timer=setInterval(async ()=>{
        const otext = await page.$$('.page-index');
        if(otext.length==pageNum){
            if(pageNum==num-1){
                clearInterval(timer)
                let pages=1
                await page.content().then( async body=>{
                    const $=cheerio.load(body)
                    const oDiv=$('#results').children();//
                    oDiv.map(function(i,e){
                        if($(this).hasClass('c-container') || $(this).hasClass('sc')){
                            dataList.push([$(this).find('.c-header-inner').eq(0).text(),$(this).find('.c-source-l').eq(0).text(),'非广告'])
                        }else if($(this).hasClass('page-index')){
                            pages+=1
                            dataList.push([String(pages),'',''])
                        }
                    })
                    createExcel(type)
                })

            }else{
                pageNum+=1;
                await page.click(`#pager`)
            }
        }
    },200)
}


function createExcel(type){
    conf.rows=dataList
    const result = nodeExcel.execute(conf);// fs将文件写到内存
    // let data = new Buffer(result,'binary');
    const name=type==1 ? 'baidu' : type==2 ? '360s' : type==3 ? 'sogou' : 'shenma'
    fs.writeFile(`${__dirname}/${name}.xlsx`, result, 'binary', (err) => {
        err ? console.log(err) : console.log('success',dataList.length);
    });
}

function getWhichPage(rows,$){
    let iss=0
    rows.map(function(i,v){
        if(!$(this).attr('href') && !$(this).attr('class')){
            iss=i+1
        }
    });
    return iss
}

async function otherOperation(page,navigationPromise,num,type,browser){
    await page.waitFor(2000)
    // const scrollTops=document.documentElement.scrollTop || document.body.scrollTop
    // const aHandle = await page.evaluateHandle(() => document.body);
    var scrollTimer =  page.evaluate(() => {
        return new Promise((resolve, reject) => {
            var totalHeight = 0
            var distance = 10
            var timer = setInterval(() => {
                window.scrollBy(0, distance)
                totalHeight += distance
                if(totalHeight >= document.body.scrollHeight){
                    window.scrollTo(0, 500)
                    clearInterval(timer)
                    resolve()
                }
            }, 100)
        })

    })
    scrollTimer.then(async (res)=>{
        await page.waitFor(2000)
        const link = await page.$('#content_left > div:nth-child(3) .t a');
        const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));    // 声明变量
        await link.click();                             // 点击跳转
        const newPage = await newPagePromise;
        await navigationPromise;
        await newPage.waitFor(5000)
        await newPage.close()
        const body= await page.content()/*.then( async body=>{*/
        const $=cheerio.load(body)
        const oDiv=$('#content_left > div');
        const rows=$('#page').children();
        oDiv.map(function(i,e){
            if($(this).hasClass('c-container')){
                const sonDivText=$(this).find('.t a').eq(0).text() ? $(this).find('.t a').eq(0).text() : $(this).find('.t a').eq(1).text()
                dataList.push([ sonDivText,$(this).find('.c-showurl').eq(0).text(),'非广告'])
            }else if(!$(this).hasClass('c-container') && $(this).attr('class')){
                if($(this).attr('id') && $(this).children('div').length===2){
                    dataList.push([$(this).find('.t a').eq(0).text(),$(this).find('.c-span18 > div:last-child a span').eq(0).text(),'广告'])
                }else if($(this).attr('id') && $(this).children('div').length===3){
                    dataList.push([$(this).find('.t a').eq(0).text(),$(this).find('div:nth-child(3) a span').eq(0).text(),'广告'])
                }else {
                    const sonDiv=$(this).children('div')
                    sonDiv.map(function(i,t){
                        if( $(this).children('div').length===2)dataList.push([$(this).find('.t a').eq(0).text(),$(this).find('.c-span18 > div:last-child a span').eq(0).text(),'广告'])
                        else dataList.push([$(this).find('.t a').eq(0).text(),$(this).children('div').eq(2).children('a').eq(0).text(),'广告'])
                    })
                }

            }
        })
        // })
        if(pageNum>=num){
            createExcel(type)
            return
        }
        let iss=await getWhichPage(rows,$)
        await page.click(`#page a:nth-child(${iss+1})`)
        const timer=setInterval(async ()=>{
            const otext=await page.$eval('#page strong span:last-child',el=> el.innerText)
            if(otext==(pageNum+1)){
                clearInterval(timer)
                pageNum+=1;
                await getDataList(page,navigationPromise,num,type,browser)
            }
        },200)
    })
}
test2(1,'杭州女装网',2)

//  exports.test=test2;
// module.exports=test2;
