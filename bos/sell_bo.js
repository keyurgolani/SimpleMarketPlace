
var mongoDao = require('../utils/mongoDao');
var dao = require('../utils/dao');
var logger = require("../utils/logger");

module.exports.sell = function(res) {
	logger.logEntry("sell_bo", "sell");
	res.render('sell', {});
};

module.exports.sendConditions = function(res) {
	logger.logEntry("sell_bo", "sendConditions");
	mongoDao.fetch('ItemConditions', {}, function(resultDoc) {
		res.send({
			"result"	:	resultDoc
		});
	});
};

module.exports.sendItems = function(res) {
	logger.logEntry("sell_bo", "sendItems");
	mongoDao.fetch('ItemDetails', {}, function(resultDoc) {
		res.send({
			"result"	:	resultDoc
		});
	});
};

module.exports.publishSale = function(user_id, title, item, condition, is_bid, price, quantity, description, res) {
	logger.logEntry("sell_bo", "publishSale");
	mongoDao.insert('SaleDetails', {
		"seller"		:	user_id,
		"item"			:	item,
		"condition"		:	condition.condition_name,
		"sale_price"	:	price,
		"title"			:	title,
		"description"	:	description,
		"is_bid"		:	(is_bid ? 1 : 0),
		"sale_qty"		:	quantity,
		"active"		:	1
	}, function(resultDoc) {
		console.log(resultDoc);
		if(resultDoc.insertedCount === 1) {
			if(is_bid) {
				setTimeout(function() {
					mongoDao.update('SaleDetails', {
						$set : {
							'active' : 0
						}
					}, {
						'_id' : resultDoc.insertedIds[0]
					}, function(resultDoc) {
						console.log(resultDoc);
						mongoDao.fetch('BidDetails')
					});
					dao.updateData("sale_details", {
						"active"	:	0
					}, {
						"sale_id"	:	rows.insertId
					}, function(update_status) {
						dao.executeQuery("select * from bid_details where sale = ? order by bid_amount desc limit 1", [rows.insertId], function(top_bid) {
							if(top_bid.length) {
								dao.fetchData("sale_qty", "sale_details", {
									"sale_id"	:	rows.insertId
								}, function(sale_qty) {
									dao.updateData("sale_details", {
										"sale_qty"	:	Number(sale_qty[0].sale_qty) - Number(top_bid[0].bid_qty)
									}, {
										"sale_id"	:	rows.insertId
									}, function(update_status) {
										dao.insertData("txn_details", {
											"sale"				:	rows.insertId,
											"buyer"				:	top_bid[0].bidder,
											"transaction_price"	:	top_bid[0].bid_amount,
											"txn_qty"			:	top_bid[0].bid_qty
										}, function(rows) {
											dao.insertData("notification_details", {
												"notification_text"	:	"Your highest bid won! You purchased " + title,
												"user_id"			:	top_bid[0].bidder
											}, function(rows) {
												//Do nothing
											});
										});
									});
								});
							}
						});
					});
				}, 345600000);
	//			}, 120000);
			}
			res.send({
				"status_code"	:	"200"
			});
		} else {
			res.send({
				"status_code"	:	"500"
			});
		}
	});
};