var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');

module.exports = function (passport) {
	passport.use('login', new LocalStrategy({ passReqToCallback: true}, function (req, username, password, done) {
		// 检查数据库是否存在用户名
		User.findOne({ 'username': username }, function (err, user) {
			if (err) return done(err);

			// 用户名不存在，重定向返回
			if (!user) {
				console.log('User not found ' + username);
				return done(null, false, req.flash('message', '用户不存在'));
			}

			// 用户名存在但是密码错误
			if (!isValidPassword(user, password)) {
				console.log('Invalid password');
				// 重定向到登录页
				return done(null, false, req.flash('message', '密码错误'));
			}

			// 用户名以及密码正确
			return done(null, user);
		});
	}));

	var isValidPassword = function (user, password) {
		return bcrypt.compareSync(password, user.password);
	};
};