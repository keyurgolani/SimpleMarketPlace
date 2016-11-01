
var mongoDao = require('../utils/mongoDao');
var logger = require("../utils/logger");

module.exports.viewItem = function(res) {
	logger.logEntry("item_bo", "item");
	res.render('viewItem', {});
};

module.exports.sendBidDetails = function(sale_id, res) {
	logger.logEntry("item_bo", "sendBidDetails");
	mongoDao.fetchOne('SaleDetails', {
		'sale_id' : sale_id
	}, function(resultDoc) {
		var bidEnd = Math.abs(resultDoc.sale_time + 345600000);
		res.send({
			"results"		:	resultDoc.bids,
			"futureTime"	:	new Date(bidEnd)
		});
	});
};

module.exports.sendItemDetails = function(sale_id, res) {
	logger.logEntry("item_bo", "sendItemDetails");
	mongoDao.fetchOne('SaleDetails', {
		'_id' : sale_id
	}, function(resultDoc) {
		var bidEnd = Math.abs(resultDoc.sale_time + 345600000);
		if(!resultDoc.active) {
			res.send({
				"item"		:	{},
				"futureTime"	:	null
			});
		} else {
			res.send({
				"item"		:	resultDoc,
				"futureTime"	:	bidEnd
			});
		}
	});
};

module.exports.placeUserBid = function(user_id, username, item_id, bid_price, bid_qty, res) {
	logger.logEntry("item_bo", "placeUserBid");
	mongoDao.fetchOne('SaleDetails', {
		'_id' : item_id
	}, function(resultDoc) {
		if(bid_price > Number(resultDoc.sale_price)) {
			console.log("here");
			mongoDao.update('SaleDetails', {
				'_id' : item_id
			}, {
				$push : {
					'bids' : {
						"bidder_id"		:	user_id,
						"bidder"		:	username,
						"bid_amount"	:	bid_price,
						"bid_qty"		:	bid_qty
					}
				},
				$set : {
					'sale_price'	:	bid_price
				}
			}, function(resultDoc) {
				logger.logBid(user_id, item_id, bid_price, bid_qty);
				res.send({
					"status_code"	:	200
				});
			});
		} else {
			res.send({
				"status_code"	:	409
			});
		}
	});
};

module.exports.addItemToCart = function(user_id, item, qty, req, res) {
	logger.logEntry("item_bo", "addItemToCart");
	item.sale_qty = qty;
	req.session.loggedInUser.cart.push(item);
	mongoDao.fetch('UserDetails', {
		'_id'		:	user_id,
	}, function(resultDoc) {
		mongoDao.update('UserDetails', {
			'_id'	:	user_id
		}, {
			$push : {
				'cart' : item
			}
		}, function(resultDoc) {
			logger.logUserCartEntry(user_id, item._id, qty, item.sale_price);
			res.send({
				"status_code"	:	200
			});
		});
	});
};

module.exports.sendTotalSold = function(item_id, res) {
	logger.logEntry("item_bo", "sendTotalSold");
	mongoDao.fetch('TransactionDetails', {
		'item._id'	:	item_id
	}, function(resultDoc) {
		console.log(resultDoc);
		res.send({
			"total_sold" : resultDoc.length
		});
	});
};

// TODO: Still not done.
module.exports.addItemToUserSuggestion = function(user_id, item_id, req) {
	logger.logEntry("item_bo", "addItemToUserSuggestion");
	logger.logItemVisit(user_id, item_id);
	mongoDao.fetchOne('SaleDetails', {
		'_id'	:	item_id
	}, function(item) {
		req.session.loggedInUser.suggestions.push(item);
		mongoDao.update('UserDetails', {
			'_id'	:	user_id
		}, {
			$push : {
				'suggestions' : item
			}
		}, function(resultDoc) {
			// Do nothing
		});
	})
};