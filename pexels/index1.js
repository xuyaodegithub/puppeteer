let puppeteer = require( 'puppeteer' ), fs = require( 'fs' ), https = require( 'https' ), allkeywords, dataIdx = 1, page,
    browser, navigationPromise, exists, idx = 0;

function readFile() {
    fs.readFile( './keys.json', 'utf8', (err, res) => {
        allkeywords = JSON.parse( res );
        initPup()
    } )
}

async function initPup() {
    const browserArgs = [
        "--proxy-server=socks5://" + '192.168.0.128',
        "--no-sandbox",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
    ];
    browser = await puppeteer.launch( {
        // headless: false,
        defaultViewport: {width: 1920, height: 1080},
        slowMo: 50,
        args: browserArgs,
        // userDataDir: userDir
    } )
    page = await browser.newPage();
    navigationPromise = page.waitForNavigation( {timeout: 0} )
    await page.goto( 'https://www.pexels.com/zh-cn/', {timeout: 0} );
    await page.focus( '#search' ).then( async res => {
        await page.keyboard.type( allkeywords[dataIdx] );
        await page.keyboard.press( 'Enter' );
        // await page.click( '#search-action' );
        await navigationPromise;
        await initData()
    } )
}

async function initData() {
    await page.waitForSelector( '.search__grid', {timeout: 0} )
    let allDiv = await page.$$( '.photos__column .hide-featured-badge .photo-item--overlay' );
    clickOne( allDiv )
}


async function clickOne(allDiv) {
    console.log( allDiv.length )
    if(allDiv.length<=idx){
        await allDiv[allDiv.length-1].hover();
        // console.log( idx, 'end' );
        await page.waitFor(1000)
        const allData = await page.$$( '.photos__column .hide-featured-badge .photo-item--overlay' );
        await clickOne( allData );
        return
    }
    await allDiv[idx].click();
    // await page.waitForSelector('#photo-modal .js-photo-page-image-img',{timeout: 0})
    await page.waitForSelector( '#photo-modal .photo-page__related-tags__container', {timeout: 0} )
    const data = {
        imgSrc: await page.$eval( '#photo-modal .js-photo-page-image-img', el => (el.src+'&dpr=2') ),
        tag: await page.$$eval( '#photo-modal .photo-page__related-tags__container li', el => el.map( it => it.innerText ) ),
    }
    https.get( data.imgSrc, res => {
        let imgData = '';
        res.setEncoding( "binary" );
        res.on( 'data', (chunk) => {
            imgData += chunk;
        } )
        res.on( 'end', () => {
            // 通过文件流操作保存图片
            fs.writeFile( `D:/images/${allkeywords[dataIdx]}/${data.tag.join( ',' )}${idx}.png`, imgData, 'binary',async (error) => {
                if (error) console.log(JSON.stringify(data),'fail');
                else console.log( idx,'下载成功！' );
                await page.click( '.rd__modal__exit' );
                await page.waitFor( 500 );
                idx += 1;
                if (idx < allDiv.length)  clickOne( allDiv );
                else {
                    console.log( idx, 'end' );
                    const allData = await page.$$( '.photos__column .hide-featured-badge .photo-item--overlay' );
                     clickOne( allData );
                }
            } )
        } )
    } )
    // fs.exists(__dirname+'/result.json',(r)=>{
    //     if(r)exists=true;
    //     else exists=false;
    //     fs.appendFile(`./result.json`,exists ? ','+JSON.stringify(data) : '['+JSON.stringify(data) ,'utf8',async (err)=>{
    //         if(err) console.log(err);
    //         else {
    //             console.log(idx,'success');
    //             await page.click('.rd__modal__exit');
    //             await page.waitFor(500);
    //             idx+=1;
    //             if(idx<allDiv.length) await clickOne(allDiv);
    //             else {
    //                 console.log(idx,'end');
    //                 const allData=await page.$$('.photos__column .hide-featured-badge .photo-item--overlay');
    //                 await clickOne(allData);
    //             }
    //         }
    //     })
    // })

}

readFile();
