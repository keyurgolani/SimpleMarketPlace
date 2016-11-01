
var mongoDao = require('../utils/mongoDao');
var logger = require("../utils/logger");

module.exports.homepage = function(res) {
	logger.logEntry("homepage_bo", "homepage");
	res.render("index", {});
};

module.exports.sendUserSearchResults = function(search_string, user_id, res) {
	logger.logEntry("homepage_bo", "sendUserSearchResults");
	mongoDao.fetch('SaleDetails', {
		'$or': [{
			'title' : {
				'$regex' : search_string,
				'$options' : 'i'
			},
			'seller_id' : {
				"$ne" : user_id
			}
		},{
			'seller' : search_string,
			'seller_id' : {
				"$ne" : user_id
			}
		}]
	}, function(resultDoc) {
		res.send({
			"saleDetails"	:	resultDoc
		});
	});
};

module.exports.sendSearchResults = function(search_string, res) {
	logger.logEntry("homepage_bo", "sendSearchResults");
	mongoDao.fetch('SaleDetails', {
		'$or': [{
			'title' : {
				'$regex' : search_string, '$options' : 'i'
			}
		},{
			'seller' : search_string
		}]
	}, function(resultDoc) {
		res.send({
			"saleDetails"	:	resultDoc
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
	mongoDao.fetch('SaleDetails', {
		'seller_id' : {
			"$ne" : user_id
		}
	}, function(resultDoc) {
		res.send({
			"saleDetails"	:	resultDoc
		});
	});
};

module.exports.sendSaleListing = function(res) {
	logger.logEntry("homepage_bo", "sendSaleListing");
	mongoDao.fetch('SaleDetails', {}, function(resultDoc) {
		res.send({
			"saleDetails"	:	resultDoc
		});
	});
};