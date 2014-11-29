var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var dbConfig = require('./db');
var mongoose = require('mongoose');
// 连接到数据库
mongoose.connect(dbConfig.url);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 配置 Passport
var passport = require('passport');
var expressSession = require('express-session');
app.use(expressSession({
	secret: 'mySecretKey',
	resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// 使用 connect-flash 提供 flash 中间件在 session 保存信息并在模板中显示
var flash = require('connect-flash');
app.use(flash());

// 初始化 Passport
var initPassport = require('./passport/init');
initPassport(passport);

var routes = require('./routes/index')(passport);
app.use('/', routes);
/*app.use('/users', users);*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


// 在特定时间清除所有预订
var User = require('./models/user');
var CronJob = require('cron').CronJob;
var clearReserve = function () {
	User.update({ reMorning : true }, { reMorning : false }, {multi: true}, function (err, numberAffected, raw) {
		if (err) throw err;
		var d = new Date();
		console.log('Clear Morning Done at ' + d);
		console.log(numberAffected);
		console.log(raw);
	});
	User.update({ reAfternoon : true }, { reAfternoon : false }, {multi: true}, function (err, numberAffected, raw) {
		if (err) throw err;
		var d = new Date();
		console.log('Clear Afternoon Done at ' + d);
		console.log(numberAffected);
		console.log(raw);
	});
	User.update({ reNight : true }, { reNight : false }, {multi: true}, function (err, numberAffected, raw) {
		if (err) throw err;
		var d = new Date();
		console.log('Clear Night Done at ' + d);
		console.log(numberAffected);
		console.log(raw);
	});
};

var job = new CronJob({
	cronTime: '00 59 23 * * *',
	onTick: clearReserve,
	start: true,
	timezone: 'Asia/Shanghai'
});

module.exports = app;
