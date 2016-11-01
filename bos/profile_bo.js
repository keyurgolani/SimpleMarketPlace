
var mongoDao = require('../utils/mongoDao');
var logger = require('../utils/logger');

module.exports.sendUserSoldItems = function(user_id, res) {
	logger.logEntry('profile_bo', 'sendUserSoldItems');
	mongoDao.fetch('TransactionDetails', {
		'item.seller_id'	:	user_id
	}, function(resultDoc) {
		res.send({
			'soldItems'	:	resultDoc
		});
	});
};

module.exports.sendUserBoughtItems = function(user_id, res) {
	logger.logEntry('profile_bo', 'sendUserBoughtItems');
	mongoDao.fetch('TransactionDetails', {
		'buyer'	:	user_id
	}, function(resultDoc) {
		res.send({
			'boughtItems'	:	resultDoc
		});
	});
};

module.exports.sendUserSaleItems = function(user_id, res) {
	logger.logEntry('profile_bo', 'sendUserSaleItems');
	mongoDao.fetch('SaleDetails', {
		'seller_id'	:	user_id
	}, function(resultDoc) {
		res.send({
			'saleItems'	:	resultDoc
		});
	});
};

module.exports.updateUserContact = function(user_id, contact, res) {
	logger.logEntry('profile_bo', 'updateUserContact');
	mongoDao.update('UserDetails', {
		'user'	:	user_id
	}, {
		$set	:	{
			'contact'	:	contact
		}
	}, function(resultDoc) {
		res.send({
			'contact'		:	contact
		});
	});
};

module.exports.updateUserDOB = function(user_id, dob, res) {
	logger.logEntry('profile_bo', 'updateUserDOB');
	mongoDao.update('UserDetails', {
		'user'	:	user_id
	}, {
		$set	:	{
			'dob'	:	dob
		}
	}, function(resultDoc) {
		res.send({
			'dob'		:	dob
		});
	});
};

module.exports.addUserAddress = function(user_id, st_address, apt, city, state, country, zip, res) {
	logger.logEntry('profile_bo', 'addUserAddress');
	mongoDao.fetchOne('UserDetails', {
		'_id'	:	user_id
	}, function(resultDoc) {
		mongoDao.update('UserDetails', {
			'_id'	:	user_id
		}, {
			$push	:	{
				'addresses'	:	{
					'st_address'		:	st_address,
					'apt'				:	apt,
					'city'				:	city,
					'state'				:	state,
					'country'			:	country,
					'zip'				:	zip
				}
			}
		}, function(resultDoc) {
			res.send({
				'status_code'	:	200
			});
		});
	});
};

module.exports.sendUserProfile = function(user_name, res) {
	logger.logEntry('profile_bo', 'sendUserProfile');
	mongoDao.fetchOne('UserDetails', {
		'username'	:	user_name
	}, function(resultDoc) {
		res.send({
			'user_profile'	:	resultDoc
		});
	});
};