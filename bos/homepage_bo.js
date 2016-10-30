
var mongoDao = require('../utils/mongoDao');
var logger = require("../utils/logger");

module.exports.homepage = function(res) {
	logger.logEntry("homepage_bo", "homepage");
	res.render("index", {});
};

module.exports.sendUserSearchResults = function(search_string, username, res) {
	logger.logEntry("homepage_bo", "sendUserSearchResults");
	mongoDao.fetch('SaleDetails', {
		'title' : {
			'$regex' : '^' + search_string, '$options' : 'i'
		},
		'seller' : {
			"$ne" : username
		}
	}, function(resultDoc) {
		res.send({
			"saleDetails"	:	resultDoc
		});
	});
};

module.exports.sendSearchResults = function(search_string, res) {
	logger.logEntry("homepage_bo", "sendSearchResults");
	mongoDao.fetch('SaleDetails', {
		'title' : {
			'$regex' : '^' + search_string, '$options' : 'i'
		}
	}, function(resultDoc) {
		res.send({
			"saleDetails"	:	resultDoc
		});
	});
};

module.exports.sendUserSuggestions = function(username, res) {
	logger.logEntry("homepage_bo", "sendUserSuggestions");
	mongoDao.fetchTop('SuggestionDetails', {
		'user' : username
	}, '_id', 4, function(resultDoc) {
		res.send({
			"suggestionDetails"	:	resultDoc
		});
	});
};

module.exports.sendSuggestions = function(res) {
	logger.logEntry("homepage_bo", "sendSuggestions");
	res.send({
		"saleDetails"	:	[]
	});
};

module.exports.sendUserSaleListing = function(username, res) {
	logger.logEntry("homepage_bo", "sendUserSaleListing");
	mongoDao.fetch('SaleDetails', {
		'seller' : {
			"$ne" : username
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