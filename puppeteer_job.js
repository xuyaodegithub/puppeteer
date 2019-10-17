const SCRIPT_DIR = './scripts/';

// var amqp = require('amqplib');
var url = require('url');
const puppeteer = require('puppeteer'), http = require('http'), path = require('path'), fs = require('fs'), utils = require('./utils/index');
const maxChromeProcessNum = 30;
var currentChromeProcessNum = 0;
main();
async function main(){
    //获取代理ip
    //var api_url = "http://dps.kdlapi.com/api/getdps/?orderid=996816975895731&num=1&pt=2&sep=4";
    if(currentChromeProcessNum < maxChromeProcessNum){
      currentChromeProcessNum ++;
      var options = {
        host: "dps.kdlapi.com",
        port: 80,
        path: "/api/getdps/?orderid=996816975895731&num=1&pt=2&sep=4"
      };
      http.get(options, function(res) {
        res.on('data', function(data) {
          console.log("proxy:"+data);
          startBrowser(data);
        }).on('end', function() {

        });
      });
      var staySenconds = Math.floor((Math.random()*30))+10;
      setTimeout(main,staySenconds*1000);
  }
}

async function startBrowser(proxy){

  const args = {};
  const browserArgs = [
    "--proxy-server=socks5://"+proxy,
    "--no-sandbox",
    "--user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
  ];
  //const file_name = "matting.deeplor.com";
  const file_name = "picup.ai";
  // const userid = Math.floor((Math.random()*10000));
  // const userDir = `${__dirname}/userDir/${userid}/`;
  const options = {
    // executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: browserArgs,
    // userDataDir:userDir
  }
  console.log(options,111111111111111111111)
  const browser = await puppeteer.launch(options);
  var scriptCode = require(SCRIPT_DIR+file_name);

  try {
    await scriptCode.main(browser,args);
  } catch (error) {
    console.log(error);
  }
  browser.close();
  currentChromeProcessNum --;

}
