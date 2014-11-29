var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
	id: String,
	username: String,
	realname: String,
	password: String,
	reMorning: { type: Boolean, default: false },
	reAfternoon: { type: Boolean, default: false },
	reNight: { type: Boolean, default: false }
});