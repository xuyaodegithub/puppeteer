const puppeteer = require('puppeteer'),devices = require('puppeteer/DeviceDescriptors');
(async () => {
    const iPhone = devices['iPhone 6'];
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage()
    // await page.emulate(iPhone);
    await page.goto('https://www.baidu.com')

    await page.setViewport({ width: 1920, height: 888 })

    await page.waitForSelector('.s_form #kw')
    await page.focus('#kw')
    await page.keyboard.type('一键抠图');
    await page.click('.s_form #kw')

    // await page.waitForSelector('#wrapper_wrapper > #container > #page > a:nth-child(2) > .pc')
    // await page.click('#wrapper_wrapper > #container > #page > a:nth-child(2) > .pc')


    // await browser.close()
})()
