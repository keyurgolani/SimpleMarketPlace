
var mongoDao = require('../utils/mongoDao');
var logger = require("../utils/logger");

module.exports.sendLoggedInUser = function(req, res) {
	logger.logEntry("common_bo", "sendLoggedInUser");
	res.send({
		"loggedInUser"	:	req.session.loggedInUser
	});
};

module.exports.sendUserNotifications = function(user_id, res) {
	logger.logEntry("common_bo", "sendUserNotifications");
	mongoDao.fetch('NotificationsDetails', {
		'user_id' : user_id
	}, function(resultDoc) {
		res.send({
			"notifications" : resultDoc
		});
	});
};

module.exports.sendNotifications = function(res) {
	logger.logEntry("common_bo", "sendNotifications");
	res.send({
		"notifications" : []
	});
};

module.exports.sendCartItems = function(res) {
	logger.logEntry("common_bo", "sendCartItems");
	res.send({
		"cart_items" : []
	});
};

module.exports.destroySession = function(req, res) {
	logger.logEntry("common_bo", "destroySession");
	req.session.destroy(function(err) {
		if(err) {
			res.send({
				"status_code"	:	500
			});
		} else {
			res.send({
				"status_code"	:	200
			});
		}
	});
};

module.exports.sendAddresses = function(user_id, res) {
	logger.logEntry("common_bo", "sendAddresses");
	mongoDao.fetch('AddressDetails', {
		'user_id' : user_id
	}, function(resultDoc) {
		res.send({
			"addresses"	:	resultDoc
		});
	});
	// dao.executeQuery("SELECT user_account.f_name, user_account.l_name, location_details.* FROM location_details, user_profile, user_account WHERE location_details.profile = user_profile.profile_id AND user_profile.user = user_account.user_id AND user_account.user_id = ?", [user_id], function(results) {
	// 	res.send({
	// 		"addresses"	:	results
	// 	});
	// });
};