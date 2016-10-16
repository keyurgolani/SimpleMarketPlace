
var dao = require('../utils/dao');
var logger = require("../utils/logger");

module.exports.homepage = function(res) {
	logger.logEntry("homepage_bo", "homepage");
	res.render("index", {});
};

module.exports.sendUserSearchResults = function(search_string, user_id, res) {
	logger.logEntry("homepage_bo", "sendUserSearchResults");
	dao.executeQuery("SELECT loggedInuser.user_name, details.* FROM sale_details AS details, user_account AS loggedInuser WHERE details.seller = loggedInuser.user_id AND loggedInuser.user_id <> ? AND details.sale_id IN (SELECT sale_id FROM sale_details AS sale, user_account AS seller WHERE sale.seller = seller.user_id AND (sale.title LIKE ? OR seller.user_name LIKE ?) AND sale.active = 1) order by details.sale_id desc", [user_id, '%' + search_string + '%', '%' + search_string + '%'], function(saleDetails) {
		res.send({
			"saleDetails"	:	saleDetails
		});
	});
};

module.exports.sendSearchResults = function(search_string, res) {
	logger.logEntry("homepage_bo", "sendSearchResults");
	dao.executeQuery("SELECT loggedInuser.user_name, details.* FROM sale_details AS details, user_account AS loggedInuser WHERE details.seller = loggedInuser.user_id AND details.sale_id IN (SELECT sale_id FROM sale_details AS sale, user_account AS seller WHERE sale.seller = seller.user_id AND (sale.title LIKE ? OR seller.user_name LIKE ?) AND sale.active = 1) order by details.sale_id desc", ['%' + search_string + '%', '%' + search_string + '%'], function(saleDetails) {
		res.send({
			"saleDetails"	:	saleDetails
		});
	});
};

module.exports.sendUserSuggestions = function(user_id, res) {
	logger.logEntry("homepage_bo", "sendUserSuggestions");
	dao.executeQuery("SELECT user.user_name, sale.* FROM user_account as user, sale_details as sale, suggestion_details as suggestions WHERE seller = user_id AND seller <> ? AND suggestions.user = ? AND sale.active = 1 AND suggestions.suggestion_item = sale.sale_id order by sale_id desc LIMIT 4", [user_id, user_id], function(suggestionDetails) {
		res.send({
			"suggestionDetails"	:	suggestionDetails
		});
	});
};

module.exports.sendSuggestions = function(res) {
	logger.logEntry("homepage_bo", "sendSuggestions");
	res.send({
		"saleDetails"	:	[]
	});
};

module.exports.sendUserSaleListing = function(user_id, res) {
	logger.logEntry("homepage_bo", "sendUserSaleListing");
	dao.executeQuery("SELECT user.user_name, sale.* FROM user_account as user, sale_details as sale WHERE seller = user_id AND seller <> ? AND sale.active = 1 order by sale.sale_id desc", [user_id], function(saleDetails) {
		res.send({
			"saleDetails"	:	saleDetails
		});
	});
};

module.exports.sendSaleListing = function(res) {
	logger.logEntry("homepage_bo", "sendSaleListing");
	dao.executeQuery("SELECT user.user_name, sale.* FROM user_account as user, sale_details as sale WHERE seller = user_id AND sale.active = 1 order by sale.sale_id desc", [], function(saleDetails) {
		res.send({
			"saleDetails"	:	saleDetails
		});
	});
};