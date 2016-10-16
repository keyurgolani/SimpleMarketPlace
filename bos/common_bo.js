
var dao = require('../utils/dao');
var logger = require("../utils/logger");

module.exports.sendLoggedInUser = function(req, res) {
	logger.logEntry("common_bo", "sendLoggedInUser");
	res.send({
		"userBO"	:	req.session.loggedInUser
	});
};

module.exports.sendUserNotifications = function(user_id, res) {
	logger.logEntry("common_bo", "sendUserNotifications");
	dao.executeQuery("SELECT * FROM notification_details WHERE user_id = ?", [user_id], function(results) {
		res.send({
			"notifications" : results
		});
	});
};

module.exports.sendNotifications = function(res) {
	logger.logEntry("common_bo", "sendNotifications");
	res.send({
		"notifications" : []
	});
};

module.exports.sendUserCartItems = function(user_id, res) {
	logger.logEntry("common_bo", "sendUserCartItems");
	dao.executeQuery("SELECT seller.user_name, sale.sale_id, sale.title, condi.condition_name, cart.cart_qty, sale.sale_price FROM cart_details AS cart, sale_details AS sale, user_account AS seller, item_conditions AS condi WHERE condi.condition_id = sale.condition AND cart.sale_item = sale.sale_id AND seller.user_id = sale.seller AND cart.user = ?", [user_id], function(results) {
		res.send({
			"cart_items" : results
		});
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
	dao.executeQuery("SELECT user_account.f_name, user_account.l_name, location_details.* FROM location_details, user_profile, user_account WHERE location_details.profile = user_profile.profile_id AND user_profile.user = user_account.user_id AND user_account.user_id = ?", [user_id], function(results) {
		res.send({
			"addresses"	:	results
		});
	});
};