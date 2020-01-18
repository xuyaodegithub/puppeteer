const puppeteer = require('puppeteer'),http=require('http'),path=require('path'),fs=require('fs'),cheerio = require('cheerio'),utils = require('./utils/index'),nodeExcel = require('excel-export');

//通过搜索引擎保存图片
async function indexs(){
    const brower = await puppeteer.launch({executablePath:'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',headless:false, });//C:\Program Files (x86)\Mozilla Firefox\firefox.exe
    const page = await brower.newPage();
    const navigationPromise = page.waitForNavigation()
    await page.setViewport({
        width:1920,
        height:1080
    })    //上面的代码和之前是一样的，不同是下面几句
    // await page.setDefaultNavigationTimeout(300000);
    await page.goto("https://www.taobao.com/",{timeout:0});
    // await initWindow(page)
    // await page.setCookie(...cookies);
    // page.setExtraHTTPHeaders({cookie: 't=1597dcd2949e57c46b4e0e7897b065b8; hng=CN%7Czh-CN%7CCNY%7C156; thw=cn; enc=u5J4WC%2B8AqCASdOBmurQHP6Dy%2F6X%2B%2Fah1xOPUzz9lWc8GB0cIVxBqg%2FdFM%2FyqGwZ0hFhuNd1%2FUW0brXJqyZbog%3D%3D; x=e%3D1%26p%3D*%26s%3D0%26c%3D0%26f%3D0%26g%3D0%26t%3D0%26__ll%3D-1%26_ato%3D0; cookie2=1695e54df7a9eaa5aca559ba097630d9; _tb_token_=e06e9d9ed03e3; _m_h5_tk=4f45c0781a2a1b3646073b0d7eb2d66d_1566969647075; _m_h5_tk_enc=1fd8f4817853d8c3d2039bdc6e21f331; whl=-1%260%260%261566960874246; mt=ci=0_0; cna=uf01FQcpK20CAX146cL32GLi; v=0; isg=BNTUhhz5deIHVeB6WshZX6CypRKGhfJ-YCEW5m61YN_iWXSjlj3Ip4rbXVFBoTBv; l=cBI54GN4vky7IN7oBOCanurza77OSIRYYuPzaNbMi_5Cv6T1xk7Oku1OIF96VjWdtW8B402lRpJ9-etkZ83UlmkgcGAN.'})
    await page.click(".site-nav-sign a.h");
    page.once('load',async ()=>{
        console.log("page loaded");
       await initWindow(page)
        await page.focus("#TPL_username_1").then(async ()=>{
            await page.keyboard.down('Control');
            await page.keyboard.press('KeyA');
            await page.keyboard.up('Control');
            await page.keyboard.down('Backspace');
            await page.keyboard.up('Backspace');
            // await page.keyboard.sendCharacter("16605813146");
            await page.keyboard.type("q845275351");
        });
        await page.focus("#TPL_password_1").then(async ()=>{
            await page.keyboard.sendCharacter("XUYAODE...85731");
        });
        await page.waitFor(1000);
        let t=await initmove(page);
       while (!t){
           t=await initmove(page);
       }
        await page.click("#J_SubmitStatic");
        page.once('load',async ()=>{//可以用 removeListener 取消对事件的监听：page.removeListener('request', logRequest);
            // await page.setViewport({width:1920,height:800})//设置生成拖大小，默认800*600
            // await page.screenshot({path: 'tbindex.png'});//生成png图片
            // await brower.close()
            console.log('图搜')
            await page.waitFor(5000);
            let input = await page.waitForSelector('#J_IMGSeachUploadBtn',{timeout: 0});
            await input.uploadFile('./imgs/2.png');
            page.once('load', async ()=>{
                // const oDiv = await page.evaluate(()=> {
                //     const scripts = document.querySelectorAll("head script");
                //     return scripts
                // })
                // console.log(oDiv,oDiv.length)
                await page.content().then(val=>{
                    const $=cheerio.load(val)
                    const str1=$('head script').eq($('head script').length-4).html().split('g_srp_loadCss();')[0].split('=')[1];
                    const i=str1.lastIndexOf(';')
                    const str=str1.substring(0,i)
                    fs.writeFile('datastr222.txt',str1,(err)=>{
                        err ? console.log(err) : console.log('success')
                    })
                    const data=JSON.parse(str)['mods']['itemlist']['data']['collections'][0]['auctions'];
                    let config={},arrs=[];
                    data.map(val=>{
                        arrs.push([val['nid'],val['title'],val['view_price'],val['item_loc'],val['nick']])
                    })
                    config.name='test'
                    config.cols = [{caption: 'nid', type: 'string'}, {caption: '名称', type: 'string'}, {
                        caption: '价格',
                        type: 'string'
                    }, {caption: '地点', type: 'string'},{caption: '店主', type: 'string'}];
                    config.rows = arrs;
                    const result = nodeExcel.execute(config);// fs将文件写到内存
                    fs.writeFile(`${__dirname}/test2.xlsx`,result,'binary',(err)=>{
                        err ? console.log(err) : console.log('success')
                    })

                })
            })

        })

        // await page.setViewport({width:1500,height:800})//设置生成拖大小，默认800*600
        // await page.screenshot({path: 'tb.png'});//生成png图片
//     // await page.pdf({path: 'hn.pdf', format: 'A4'});//生成pdf
        // const srcs = await page.evaluate(()=> {
        //     const images = document.querySelectorAll("td a");
        //     return Array.prototype.map.call(images,img=>img.innerHTML)
        // })        //遍历图片并且保存
        // srcs.forEach(async (src)=> {
        //     const ext = path.extname(src) ? path.extname(src):".jpg";
        //     const file = path.join('./imgs',`${Date.now()}${ext}`)
        //     http.get(src,res=>{
        //         console.log(res)
        //         res.pipe(fs.createWriteStream(file)).on('finish',(err)=>{
        //             if(err){
        //                 console.log(err)
        //         } else {
        //                 console.log("done")
        //         }
        //         })
        //     })
        // })
    })
};
function setJson(str){
    let arr=str.split('; ');
    arr.map((v,i)=>{
        let a=v.split('=')
        arr[i]={[a[0]]:a[1]}
    })
    return arr
}

async function initWindow(page){
    await page.evaluate(utils.js1);
    await page.evaluate(utils.js3);
    await page.evaluate(utils.js4);
    await page.evaluate(utils.js5)
}
async function initmove(page){
    if(!await page.$('#nc_1_n1z')) return true;
    await page.hover('#nc_1_n1z')
    await page.mouse.down();
    await page.mouse.move(1498,0);
    await page.mouse.up(1498,0);
    await page.waitFor(2000);
    if(JSON.stringify(await page.$eval('#nocaptcha', el => el.innerHTML)).indexOf('验证通过')<0){//await page.$eval('#nc_1__scale_text b', el => el.innerText)!=='验证通过'   page.$('.errloading') && !page.$('#nc_1__scale_text b')
        await page.click(".nc-lang-cnt a");
        await page.waitFor(1000);
        return false
    }else{
        return true
    }
}
indexs()
