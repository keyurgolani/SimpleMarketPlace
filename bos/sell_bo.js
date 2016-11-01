
var mongoDao = require('../utils/mongoDao');
var logger = require('../utils/logger');

module.exports.sell = function(res) {
	logger.logEntry('sell_bo', 'sell');
	res.render('sell', {});
};

module.exports.sendConditions = function(res) {
	logger.logEntry('sell_bo', 'sendConditions');
	mongoDao.fetch('Conditions', {}, function(resultDoc) {
		res.send({
			'result'	:	resultDoc
		});
	});
};

module.exports.sendCategories = function(res) {
	logger.logEntry('sell_bo', 'sendCategories');
	mongoDao.fetch('Categories', {}, function(resultDoc) {
		res.send({
			'result'	:	resultDoc
		});
	});
};

module.exports.publishSale = function(user_id, username, title, category, condition, is_bid, price, quantity, description, res) {
	logger.logEntry('sell_bo', 'publishSale');
	mongoDao.insert('SaleDetails', {
		'seller_id'		:	user_id,
		'seller'		:	username,
		'category'		:	category,
		'condition'		:	condition,
		'sale_price'	:	price,
		'title'			:	title,
		'description'	:	description,
		'sale_qty'		:	quantity,
		'is_bid'		:	is_bid,
		'bids'			:	[],
		'active'		:	true,
		'sale_time'		:	new Date().getTime()
	}, function(insertResult) {
		if(insertResult.insertedCount === 1) {
			// TODO: Bid Functionality not refined yet.
			if(is_bid) {
				setTimeout(function() {
					mongoDao.update('SaleDetails', {
						'_id' : insertResult.insertedIds[0]
					}, {
						$set : {
							'active' : false
						}
					}, function(resultDoc) {
						mongoDao.fetchOne('SaleDetails', {
							'_id' : insertResult.insertedIds[0]
						}, function(resultDoc) {
							if(resultDoc.bids.length !== 0) {
								resultDoc.bids.sort(function(a, b) {
									return a.bid_price - b.bid_price;
								});
								// --------------------------Continue working here
								console.log(resultDoc.bids);
								mongoDao.update('SaleDetails', {
									'_id' : insertResult.insertedIds[0]
								}, {
									$inc : {
										'sale_qty' : -topBid.bid_qty
									}
								}, function(resultDoc) {
									mongoDao.insert('TransactionDetails', {
										'sale'				:	insertResult.insertedIds[0],
										'buyer'				:	topBid.bidder,
										'transaction_price'	:	topBid.bid_amount,
										'txn_qty'			:	topBid.bid_qty
									}, function(resultDoc) {
										if(resultDoc.insertedCount === 1) {
											mongoDao.insert('NotificationDetails', {
												'notification_text'	:	'Your highest bid won! You purchased ' + title,
												'user_id'			:	topBid.bidder
											}, function(resultDoc) {
												// Do nothing
											});
										}
									});
								});
							}
						});
					});
				// }, 345600000);
				// }, 120000);
				// }, 60000);
				}, 0);
			}
			res.send({
				'status_code'	:	'200'
			});
		} else {
			res.send({
				'status_code'	:	'500'
			});
		}
	});
};