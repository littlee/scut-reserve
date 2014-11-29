var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');

module.exports = function (passpost) {
	passpost.use('signup', new LocalStrategy({ passReqToCallback: true }, function (req, username, password, done) {
		findOrCreateUser = function () {
			User.findOne({ 'username': username }, function (err, user) {
				if (err) {
					console.log('Error in signup ' + err);
					return done(err);
				}

				// 用户名已经存在
				if (user) {
					console.log('User already exists: ' + username);
					return done(null, false, req.flash('message', '用户已存在'));
				}
				else {
					// 新建用户
					var newUser = new User();

					newUser.username = username;
					newUser.realname = req.param('realname');
					newUser.password = createHash(password);

					// 保存用户
					newUser.save(function (err) {
						if (err) {
							console.log('Error in saving user: ' + err);
							throw err;
						}
						console.log('User registeration successful.');
						return done(null, newUser);
					});
				}
			});
		};

		process.nextTick(findOrCreateUser);
	}));

	var createHash = function (password) {
		return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
	};
};