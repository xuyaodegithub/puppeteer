var puppeteer = require( 'puppeteer' ), fs = require( 'fs' ), https = require( 'https' ), allkeywords, dataIdx =4,
    page,
    browser, navigationPromise, exists, idx = 0, Ss = require( "simplebig" ), arrId = [];

function readFile() {
    fs.readFile( './keys.json', 'utf8', (err, res) => {
        allkeywords = JSON.parse( res );
        fs.readdir( "D:/images", function (err, files) {
            if (err) {
                return console.error( err );
            }
            if (!files.includes( allkeywords[dataIdx] )) {
                fs.mkdir( `D:/images/${allkeywords[dataIdx]}`, function (err) {
                    if (err) {
                        return console.error( err );
                    }
                    console.log( "目录创建成功。" );
                    initPup()
                } );
            }else  initPup()
        } );
        // initPup()
    } )
}

async function initPup() {
    const browserArgs = [
        "--proxy-server=socks5://" + '192.168.0.128',
        "--no-sandbox",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
    ];
    browser = await puppeteer.launch( {
        executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        ignoreDefaultArgs: ["--enable-automation"],
        headless: false,
        defaultViewport: {width: 1920, height: 1080},
        slowMo: 50,
        args: browserArgs,
        // userDataDir: userDir
    } )
    page = await browser.newPage();
    await page.on( 'error', async () => {
        await browser.close();
        setTimeout( initPup, getrandom( 1000, 3000 ) );
    } )
    navigationPromise = page.waitForNavigation( {timeout: 0} )
    await page.goto( `https://www.pexels.com/zh-cn/search/${allkeywords[dataIdx]}/`, {timeout: 0} );
    // await page.waitForSelector( '#search', {timeout: 0} )
    // await page.focus( '#search' ).then( async res => {
    //     await page.keyboard.type( allkeywords[dataIdx] );
    //     await page.keyboard.press( 'Enter' );
    //     // await page.click( '#search-action' );
    //     await navigationPromise;
        await initData()
    // } )
}

async function initData() {
    await page.waitForSelector( '.search__grid', {timeout: 0} )
    let allDiv = await page.$$eval( '.photos__column .hide-featured-badge .photo-item--overlay .js-photo-link > img', el => el.map( it => ({
        src: it.srcset,
        tag: it.alt
    }) ) );
    clickOne( allDiv )
}

async function initmove() {
    const oClose = await newPage2.$( '#bomb_close' )
    if (oClose) {
        console.log( 'close' )
        await newPage2.click( '#bomb_close' )
        console.log()
    }
    console.log( 'close3' )
    await newPage2.waitFor( getrandom( 2000, 5000 ) );
    var scrollTimer2 = newPage2.evaluate( () => {
        return new Promise( (resolve, reject) => {
            var totalHeight = 0;
            // var distance = 50;
            var timer = setInterval( () => {
                let distance = Math.floor( Math.random() * (200 - 30 + 1) ) + 30;
                window.scrollBy( 0, distance );
                totalHeight += distance;
                if (totalHeight >= (document.body.scrollHeight - document.documentElement.clientHeight)) {
                    // window.scrollTo(0, 500)
                    clearInterval( timer )
                    resolve()
                }
            }, Math.floor( (Math.random() * 2500) ) + 1000 )//Math.floor((Math.random()*5000))+3000
        } )

    } )
    scrollTimer2.then( async () => {
        console.log( 'close4' )
        await newPage2.waitFor( getrandom( 2000, 5000 ) );
        const link = await newPage2.$$( '.footer_rp_flk .fl a' );
        // const idx=parseInt(Math.random()*link.length)
        const newPagePromise = new Promise( x => browser.once( 'targetcreated', target => x( target.page() ) ) );    // 声明变量
        await link[getrandom( 0, link.length - 1 )].click();                             // 点击跳转
        const newPage = await newPagePromise;
        await newPage.waitFor( 10000 );
        await newPage.close();
        await newPage2.close();
        await initone()
        // linkNum+=1;
        // await initFive(page, navigationPromise, browser)
    } )
}

async function clickOne(allDiv) {
    console.log( allDiv.length ,1111)
    const alls = await page.$$( '.photos__column .hide-featured-badge .photo-item--overlay' )
    await alls[alls.length - 1].hover();
    // console.log( idx, 'end' );
    await page.waitFor( 3000 );
    if (allDiv.length <= idx) {
        allDiv.map( item => {
            const id = (item.src.split( 'photos/' )[1]).split( '/' )[0];
            if (!arrId.includes( id )) arrId.push( id )
        } )
        const allData = await page.$$eval( '.photos__column .hide-featured-badge .photo-item--overlay .js-photo-link > img', el => el.map( it => ({
            src: it.srcset,
            tag: it.alt
        }) ) );
        await clickOne( allData );
        return
    }
    allDiv.filter( items => (!(arrId.some( it => items.src.includes( it ) ))) ).map( (item, ix) => {
        const id = (item.src.split( 'photos/' )[1]).split( '/' )[0];
        const data = {
            imgSrc: item.src.split( '&dpr' )[0] + '&h=750&w=1260&dpr=2',//
            tag: item.tag.split( ' 的 ' )[0],
        }
        console.log(1111)
        // if(idx<4)console.log(data,item,allDiv.slice(idx),allDiv.slice(idx).length)
        https.get( data.imgSrc, res => {
            let imgData = '';
            res.setEncoding( "binary" );
            res.on( 'data', (chunk) => {
                imgData += chunk;
            } )
            res.on( 'error', function (err) {
                console.log( err );
                idx += 1;
            } );
            res.on( 'end', async () => {
                // 通过文件流操作保存图片
                fs.writeFile( `D:/images/${allkeywords[dataIdx]}/${Ss.t2s( data.tag )}${idx}.png`, imgData, 'binary', async (error) => {
                    if (error) console.log( JSON.stringify( data ), 'fail', error );
                    else console.log( idx, '下载成功！' );
                    idx += 1;
                    arrId.push( id );
                    if (idx >= allDiv.length-5) {
                        // console.log( idx, 'end' );
                        await page.waitFor( 2000 )
                        const allDatas = await page.$$eval( '.photos__column .hide-featured-badge .photo-item--overlay .js-photo-link > img', el => el.map( it => ({
                            src: it.srcset,
                            tag: it.alt
                        }) ) );
                        await clickOne( allDatas );
                    }
                } )
            } )
        } )
    } )
}

readFile();
