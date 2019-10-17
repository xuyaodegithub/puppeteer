/**
 * Created by Yan on 19/9/04.
 */
var amqp = require('amqplib'),indexs=require('./test2'),indexs=require('./test2'),cluster = require('cluster'),fork = require('child_process').fork;
// 首先我们需要通过amqp连接本地的rabbitmq服务，返回一个promise对象
console.log(process.argv,'_______________')
amqp.connect('amqp://admin:17huoFighting!@47.111.18.180').then(function(conn){
//进程检测到终端输入CTRL+C退出新号时，关闭RabbitMQ队列。
    process.once('SIGN',function(){conn.close();});
//连接成功后创建通道
    return conn.createChannel().then(function(ch){
        var ex='xuyao_test'
//通道创建成功后我们通过通道对象的assertQueue方法来监听hello队列，并设置durable持久化为false。这里消息将会被保存在内存中。该方法会返回一个promise对象。
        var ok = ch.assertExchange(ex,'topic');
//监听创建成功后，我们使用ch.consume创建一个消费者。指定消费hello队列和处理函数，在这里我们简单打印一句话。设置noAck为true表示不对消费结果做出回应。
//ch.consume会返回一个promise，这里我们把这个promise赋给ok。
        ok = ok.then(function() {
            return ch.assertQueue('test_xuyao_queue');// {exclusive: true}
        });
        ok = ok.then(function(_qok) {
            console.log(_qok)
            return ch.consume(_qok.queue, logMessage, {noAck: true});
        });
        return ok.then(function() {
            console.log(' [*] Waiting for logs. To exit press CTRL+C.');
        });
        function logMessage(msg) {
            console.log("服务端消费者",
                msg.fields.routingKey,
                msg.content.toString());
            let data=JSON.parse(msg.content.toString());
            const numCPUs = require('os').cpus().length;
            if(cluster.isMaster){
                for(let i=0;i<data.num;i++){
                    // cluster.fork()
                    cluster.fork('./test2.js')
                }
            }
            // indexs.forks(data.url,data.num)

        }
    });
}).catch(console.warn);//如果报错打印报错信息
