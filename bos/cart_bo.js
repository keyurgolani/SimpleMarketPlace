
var mongoDao = require('../utils/mongoDao');
var logger = require("../utils/logger");

module.exports.cart = function(res) {
	logger.logEntry("cart_bo", "cart");
	res.render('cart', {});
};

module.exports.checkout = function(user_id, res) {
	logger.logEntry("cart_bo", "checkout");
	var success = true;
	mongoDao.fetch('CartDetails', {
		'user_id' : user_id
	}, function(resultDoc) {
		for (var i = resultDoc.length - 1; i >= 0; i--) {
			mongoDao.insert('TransactionDetails', {
				'item' : resultDoc[i],
				'buyer' : user_id
			}, function(resultDoc) {
				if(resultDoc.insertedCount === 1) {
					logger.logUserCheckout(user_id, resultDoc[i].sale, resultDoc[i].txn_qty, resultDoc[i].transaction_price);
					mongoDao.fetch('SaleDetails', {
						'sale_id' : resultDoc[i].sale
					}, function(resultDoc) {
						var remaining_qty = Number(results[0].sale_qty) - Number(resultDoc[i].txn_qty);
						mongoDao.update('SaleDetails', {
							'sale_id' : resultDoc[i].sale
						}, {
							$set : {
								'sale_qty' : remaining_qty
							}
						}, function(resultDoc) {
							if(remaining_qty === 0) {
								mongoDao.update('SaleDetails', {
									'sale_id' : resultDoc[i].sale
								}, {
									$set : {
										'active' : 0
									}
								}, function(resultDoc) {
									// Do nothing
								});
							}
						});
					});
				} else {
					success = false;
				}
			});
		}
	});
	if(success) {
		mongoDao.remove('CartDetails', {
			'user_id' : user_id
		}, function(resultDoc) {
			res.send({
				"status_code" : 200
			});
		});
	}
};

module.exports.sendCartAvailability = function(user_id, res) {
	logger.logEntry("cart_bo", "sendCartAvailability");
	var available = true;
	// dao.executeQuery("select sale_details.sale_qty as available_qty, cart_details.cart_qty from sale_details, cart_details where cart_details.sale_item = sale_details.sale_id and cart_details.user = ?", [user_id], function(results) {
	// 	for(var i = 0; i < results.length; i++) {
	// 		if(Number(results[i].available_qty) < Number(results[i].cart_qty)) {
	// 			available = false;
	// 		}
	// 	}
	// });
	res.send({
		"available"	:	available
	});
};

module.exports.removeFromCart = function(user_id, item_id, res) {
	logger.logEntry("cart_bo", "removeFromCart");
	mongoDao.remove('CartDetails', {
		'user_id' : user_id
	}, function(resultDoc) {
		console.log(resultDoc);
		logger.logUserCartRemove(user_id, item_id);
		res.send({ });
	})
	// dao.executeQuery("delete from cart_details where user = ? and sale_item = ?", [user_id, item_id], function(results) {
	// 	logger.logUserCartRemove(user_id, item_id);
	// 	res.send({ });
	// });
};