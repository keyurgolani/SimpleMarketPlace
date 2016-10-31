
var mongoDao = require('../utils/mongoDao');
var logger = require('../utils/logger');

module.exports.sell = function(res) {
	logger.logEntry('sell_bo', 'sell');
	res.render('sell', {});
};

module.exports.sendConditions = function(res) {
	logger.logEntry('sell_bo', 'sendConditions');
	mongoDao.fetch('ItemConditions', {}, function(resultDoc) {
		res.send({
			'result'	:	resultDoc
		});
	});
};

module.exports.sendItems = function(res) {
	logger.logEntry('sell_bo', 'sendItems');
	mongoDao.fetch('ItemDetails', {}, function(resultDoc) {
		res.send({
			'result'	:	resultDoc
		});
	});
};

module.exports.publishSale = function(user_id, title, item, condition, is_bid, price, quantity, description, res) {
	logger.logEntry('sell_bo', 'publishSale');
	mongoDao.insert('SaleDetails', {
		'seller'		:	user_id,
		'item'			:	item_name,
		'condition'		:	condition.condition_name,
		'sale_price'	:	price,
		'title'			:	title,
		'bids'			:	[],
		'description'	:	description,
		'is_bid'		:	(is_bid ? 1 : 0),
		'sale_qty'		:	quantity,
		'active'		:	1,
		'sale_time'		:	new Date().getTime()
	}, function(insertResult) {
		if(resultDoc.insertedCount === 1) {
			if(is_bid) {
				setTimeout(function() {
					mongoDao.update('SaleDetails', {
						$set : {
							'active' : 0
						}
					}, {
						'_id' : insertResult.insertedIds[0]
					}, function(resultDoc) {
						console.log(resultDoc);
						mongoDao.fetchTop('BidDetails', {
							'sale_id' : insertResult.insertedIds[0]
						}, 'bid_amount', 1, function(topBid) {
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
						});
					});
				}, 345600000);
	//			}, 120000);
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