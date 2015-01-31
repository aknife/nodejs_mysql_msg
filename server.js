//建立MySQL连接, 根据自己环境修改相应的数据库信息
var io = require('socket.io').listen(8080),
    mysql = require('mysql'),
    clientNums = [],
    sqlLink = mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'aknife',
        database: 'php_nodejs_socket_test',
        port: 3306
    }),
    // 间隔查询时间 毫秒
    POLLING_INTERVAL = 1000,
    pollingTimer,

    // 定义浏览器标题闪烁
    ifShow = 0;

// 检查数据库连接是否正常
sqlLink.connect(function(err) {
    // 不出现错误信息，那表示数据库连接成功
    console.log(err);
});

//间隔3秒去查询数据库表，有更新就推送给客户端
var pollingLoop = function() {

    // 查询数据库
    //var query = sqlLink.query('SELECT * FROM message order by state asc,time desc'),
    var query = sqlLink.query('SELECT * FROM message order by state asc,time desc'),
        articles = []; // 用于保存查询结果

    // 查询结果监听
    query
    .on('error', function(err) {
        // 查询出错处理
        console.log(err);
        updateSockets(err);
    })
    .on('result', function(user) {
        // 加入查询到的结果到articles数组
        articles.push(user);
    })
    .on('end', function() {
        // 检查是否有客户端连接，有连接就继续查询数据库
        if (clientNums.length) {
            setTimeout(pollingLoop, POLLING_INTERVAL);
            //pollingLoop();
            updateSockets({
                articles: articles
            });
        }
    });
};


// 创建一个websocket连接，实时更新数据
io.sockets.on('connection', function(socket) {
    console.log('当前连接客户端数量:' + clientNums.length);
    // 有客户端连接的时候才去查询，不然都是浪费资源
    if (!clientNums.length) {
        pollingLoop();
    }

    // 用户退出
    socket.on('disconnect', function() {
        var socketIndex = clientNums.indexOf(socket);
        console.log('socket = ' + socketIndex + ' disconnected');
        if (socketIndex >= 0) {
            clientNums.splice(socketIndex, 1);
        }
    });

    // 修改已读状态
    socket.on('changeState', function (data) {
        // 执行MySQL 修改状态
        sqlLink.query('UPDATE message SET state=1 WHERE id='+data.id);
    });

    //console.log('有新的客户端连接!');
    clientNums.push(socket);
});

var updateSockets = function(data) {
    // 推送最新的更新信息到所以连接到服务器的客户端
    if (ifShow == 0) {
        data.ifShow = 0;
        ifShow = 1;
    } else {
        data.ifShow = 1;
        ifShow = 0
    }
    clientNums.forEach(function(tmpSocket) {
        tmpSocket.volatile.emit('notification', data);
    });
};

