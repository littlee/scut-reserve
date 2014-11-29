var express = require('express');
var router = express.Router();
var User = require('../models/user');
var nimble = require('nimble');

var isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	// 如果用户没有认证，重定向至登录页
	res.redirect('/');
};

module.exports = function (passport) {
	/* GET login page */
	router.get('/', function (req, res) {
		res.render('index', { message: req.flash('message') });
	});

	/* Handle login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash: true
	}));

	/* GET registeration page */
	router.get('/signup', function (req, res) {
		res.render('register', { message: req.flash('message') });
	});

	/* Handle registeration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash: true
	}));

	/* GET home page */
	router.get('/home', isAuthenticated, function (req, res) {
		var countReserve = {};
		var getCountMorning = function(cb) {
			User.count({ reMorning : true }, function (err, count) {
				if (err) throw err;
				countReserve.morning = count;
				cb();
			});			
		};

		var getCountAfternoon = function (cb) {
			User.count({ reAfternoon : true }, function (err, count) {
				if (err) throw err;
				countReserve.afternoon = count;
				cb();
			});
		};

		var getCountNight = function (cb) {
			User.count({ reNight : true }, function (err, count) {
				if (err) throw err;
				countReserve.night = count;
				cb();
			});
		};

		var renderPage = function(cb) {
			res.render('home', {
				user: req.user,
				countReserve: countReserve
			});
			cb();
		};

		nimble.series([getCountMorning, getCountAfternoon, getCountNight, renderPage]);
	});

	/* POST home */
	router.post('/home', isAuthenticated, function (req, res) {
		var reserve = req.param('reserve');
		var id = req.user._id;

		User.findById(id, function (err, user) {
			if (err) throw err;
			if (reserve === 'rm') {
				user.reMorning = true;
			}
			else if (reserve === 'cm') {
				user.reMorning = false;
			}
			else if (reserve === 'ra') {
				user.reAfternoon = true;
			}
			else if (reserve === 'ca') {
				user.reAfternoon = false;
			}
			else if (reserve === 'rn') {
				user.reNight = true;
			}
			else if (reserve === 'cn') {
				user.reNight = false;
			}

			user.save(function (err) {
				if (err) throw err;
				res.redirect('/home');
			});
		});
	});

	/* Handle logout */
	router.get('/signout', function (req, res) {
		req.logout();
		res.redirect('/');
	});

	/* GET check */
	router.get('/check', function (req, res) {
		var reservation = {};
		var getReserveMorning = function (cb) {
			User.find({ reMorning: true }, 'username realname', function (err, doc) {
				reservation.morning = [];
				for (var i in doc) {
					reservation.morning.push(doc[i]);
				}
				cb();
			});
		};
		var getReserveAfternoon = function (cb) {
			User.find({ reAfternoon: true }, 'username realname', function (err, doc) {
				reservation.afternoon = [];
				for (var i in doc) {
					reservation.afternoon.push(doc[i]);
				}
				cb();
			});
		};
		var getReserveNight = function (cb) {
			User.find({ reNight: true }, 'username realname', function (err, doc) {
				reservation.night = [];
				for (var i in doc) {
					reservation.night.push(doc[i]);
				}
				cb();
			});
		};
		var renderPage = function (cb) {
			res.render('check', { reservation: reservation });
		};

		nimble.series([getReserveMorning, getReserveAfternoon, getReserveNight, renderPage]);
	});

	return router;
};