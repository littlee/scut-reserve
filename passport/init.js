var login = require('./login');
var signup = require('./signup');
var User = require('../models/user');

module.exports = function (passport) {
	// Passport 需要序列化以及反序列化以支持连续的会话
	passport.serializeUser(function (user, done) {
		// console.log('serializing user:');
		// console.log(user);
		done(null, user._id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			// console.log('deserializing user: ');
			// console.log(user);
			done(err, user);
		});
	});

	// 设置 Passport 的登录与注册策略
	login(passport);
	signup(passport);
};	