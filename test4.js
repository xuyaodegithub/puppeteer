const cluster = require('cluster'),fs = require('fs'),test=require('./test2.js')

function readfiles(){
// 异步读取
    fs.readFile(`${__dirname}/keyword.txt`, function (err, data) {
        if (err) {
            return console.error(err);
        }
        const wordsArr=data.toString().split('，')
        const numCPUs = require('os').cpus().length;
        if(cluster.isMaster){
            for(let i=0;i<wordsArr.length;i++){
            cluster.fork(test(1,wordsArr[i],10))
        }
        }

    });
}
readfiles()
// test2(4,'在线抠图',10)

//  exports.test=test2;
