//加载依赖库
var express = require('express'),
    path = require('path'),
    ejs = require('ejs'),
    fs = require('fs'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    request = require('request'),
    compression = require('compression')

//应用实例化
var app = express();

//定义EJS模板引擎和模板文件位置
app.engine('.html', ejs.__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

//压缩
app.use(compression());
app.use(logger('dev'));

//定义数据解析器
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
//定义cookie解析器
app.use(cookieParser());

//定义静态文件目录
app.use('/public', express.static('public'));

//路由控制管理，每个模块的路由集中处理
var router_client2 = require('./routes/client2');
var router_admin = require('./routes/admin');
router_client2(app, request);
router_admin(app);

//处理404错误
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//500错误处理
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        status: err.status || '500',
        message: err.message,
        error: err
    });
});

app.listen("3000");

module.exports = app;