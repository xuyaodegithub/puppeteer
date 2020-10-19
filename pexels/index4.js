let puppeteer = require( 'puppeteer' ), fs = require( 'fs' ), https = require( 'https' ), allkeywords, dataIdx =4,
    page,userDir = `D:/新建文件夹/userIp/1/`,
    browser, navigationPromise, exists, idx =3, idxson = 0;

function readFile() {
    fs.readFile( './keys.json', 'utf8', (err, res) => {
        allkeywords = JSON.parse( res );
        fs.readdir( "D:/images/1015", function (err, files) {
            if (err) {
                return console.error( err );
            }
            if (!files.includes( allkeywords[dataIdx] )) {
                fs.mkdir( `D:/images/1015/${allkeywords[dataIdx]}`, function (err) {
                    if (err) {
                        return console.error( err );
                    }
                    console.log( "目录创建成功。" );
                    initPup()
                } );
            }else  initPup()
        } );
    } )
}

async function initPup() {
    const browserArgs = [
        "--proxy-server=socks5://" + '192.168.0.128',
        "--no-sandbox",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
    ];
    browser = await puppeteer.launch( {
        headless: false,
        defaultViewport: {width: 1920, height: 1080},
        slowMo: 50,
        // args: browserArgs,
        // userDataDir: userDir
    } )
    page = await browser.newPage();
    navigationPromise = page.waitForNavigation( {timeout: 0} );
    await page.goto( `https://pixabay.com/zh/images/search/${encodeURI(allkeywords[dataIdx])}/?pagi=${idx}`, {timeout: 0} );
    initData()
    // await page.focus( '.q[name=q]' ).then( async res => {
    //     await page.keyboard.type( allkeywords[dataIdx] );
    //     await page.keyboard.press( 'Enter' );
    //     // await page.click( '#search-action' );
    //     await navigationPromise;
    //     await initData()
    // } )
}

async function initData() {
    await page.waitForSelector( '.search_results', {timeout: 0} )
    let allDiv = await page.$$( '.search_results > div' );
    clickOne( allDiv )
}

async function clickOne(allDiv) {
    console.log( allDiv.length )
    allDiv.map( async (item, index) => {
        const data = {
            imgSrc: await item.$eval( 'a > img', el => (el.outerHTML.indexOf( 'data-lazy' ) > -1 ? el.outerHTML.split( 'data-lazy="' )[1].split( '"' )[0].replace( '__340', '_960_720' ) : el.src.replace( '__340', '_960_720' )) ),
            tag: await item.$$eval( 'span[itemprop=caption] a', el => el.map( it => it.innerText ) ),
        }
        https.get( data.imgSrc, res => {
            let imgData = '';
            res.setEncoding( "binary" );
            res.on( 'data', (chunk) => {
                imgData += chunk;
            } )
            res.on( 'end', () => {
                // 通过文件流操作保存图片
                fs.writeFile( `D:/images/1015/${allkeywords[dataIdx]}/${data.tag.join( ',' )}${idx}.png`, imgData, 'binary', async (error) => {
                    if (error) console.log( JSON.stringify( data ), 'fail' );
                    else {
                        await page.waitFor( 500 );
                        idxson += 1;
                        await page.waitFor( 500 );
                        if (idxson >= allDiv.length - 1) {
                            console.log( idx, '下载成功 END！' );
                            if(idx>=50){
                                console.log('page:10;end')
                                return
                            }
                            idx+=1;
                            idxson=0;
                            await page.waitFor( 10000 );
                            await page.goto( `https://pixabay.com/zh/images/search/${encodeURI(allkeywords[dataIdx])}/?pagi=${idx}` , {timeout: 0})
                            await page.waitFor( 1000 );
                            initData()
                        } else console.log( idxson, 'end' ,allDiv.length);
                    }
                } )
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
