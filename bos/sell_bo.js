
var mongoDao = require('../utils/mongoDao');
var logger = require('../utils/logger');

module.exports.sell = function(res) {
	logger.logEntry('sell_bo', 'sell');
	res.render('sell', {});
};

module.exports.sendConditions = function(res) {
	logger.logEntry('sell_bo', 'sendConditions');
	rabbitMQ.sendMessage('conditions', {}, function(payload) {
		res.send({
			'result'	:	payload.conditions
		});
	});
};

module.exports.sendCategories = function(res) {
	logger.logEntry('sell_bo', 'sendCategories');
	rabbitMQ.sendMessage('categories', {}, function(payload) {
		res.send({
			'result'	:	payload.categories
		});
	});
};

module.exports.publishSale = function(user_id, username, title, category, condition, is_bid, price, quantity, description, res) {
	logger.logEntry('sell_bo', 'publishSale');
	rabbitMQ.sendMessage('publishSale', {
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
	}, function(payload) {
		if(payload.success) {
			if(is_bid) {
				setTimeout(function() {
					rabbitMQ.sendMessage('inactiveSale', {
						'_id' : payload.inserted_sale
					}, function(payload) {
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
		}
	});
};