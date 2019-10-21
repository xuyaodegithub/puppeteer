const puppeteer = require('puppeteer'),fs = require('fs'),https=require('https');
var allData=[],type=2,allLength=0,idx=0;
async function test2() {
    const urls='https://www.remove.bg/upload';
    const browserArgs = [
        "--proxy-server=socks5://"+'192.168.0.128',
        "--no-sandbox",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
    ];
    fs.readFile(`dataJson/data${type}.json`,async (err,data)=>{
        if(err)console.log(err,'dddddddddddddd')
        else {
            allLength=JSON.parse(data).length;
            allData=JSON.parse(data);
            const browser = await puppeteer.launch({executablePath:'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',headless:false,defaultViewport:{width:1920,height:1080},slowMo:50,args:browserArgs})//,userDataDir:`${__dirname}/userDir`
            const page = await browser.newPage();
            await page.goto(urls,{timeout:0});
            await page.on('dialog', async dialog => {
                console.log(dialog.message());//打印出弹框的信息
                console.log(dialog.type());//打印出弹框的类型，是alert、confirm、prompt哪种
                console.log(dialog.defaultValue());//打印出默认的值只有prompt弹框才有
                dialog.accept(allData[idx].src)
                await getDataList(page,browser)
            });
            await page.waitForSelector('.col-md-offset-0',{timeout: 0});
            await page.click('.col-md-offset-0 p:nth-child(2) > a');
        }
    })
}
async function  getDataList(page,browser){
    // await page.waitForSelector('.image-result',{timeout: 0})
    await page.waitForSelector('.image-result > div:nth-child(2) .btn-default',{timeout: 0})
    await page.waitForSelector('.image-result > div:nth-child(2)',{timeout: 0})
    await page.waitFor(2000)
    const resultStr=await page.$eval('.image-result > div:nth-child(2)',el=>el.outerHTML)
    if(resultStr.includes('img-responsive')){
        const url=await page.$eval('.image-result > div:nth-child(2) .img-responsive',el=>el.src)
        https.get(url,res=>{
            //用来存储图片二进制编码
            let imgData = '';
            //设置图片编码格式
            res.setEncoding("binary");
            res.on('data', (chunk) => {
                imgData += chunk;
            })

            //请求完成执行的回调
            res.on('end', () => {
                // 通过文件流操作保存图片
                fs.writeFile(`./image/${idx}.png`, imgData, 'binary', (error) => {
                    if (error) console.log(error)
                    else {
                        console.log('下载成功！')
                        addIdx(page,browser)
                    }
                })
            })
        })
    }else{
       await addIdx(page,browser)
    }

}

async function addIdx(page,browser){
    idx++;
    await page.waitForSelector('.image-result--delete-btn');
    await page.click('.image-result--delete-btn');
    await page.click('.col-md-offset-0 p:nth-child(2) > a');
}

test2()
