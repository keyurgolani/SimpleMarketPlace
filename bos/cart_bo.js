
var dao = require('../utils/dao');
var logger = require("../utils/logger");

module.exports.cart = function(res) {
	logger.logEntry("cart_bo", "cart");
	res.render('cart', {});
};

module.exports.checkout = function(user_id, res) {
	logger.logEntry("cart_bo", "checkout");
	var success = true;
	dao.executeQuery("select cart_details.sale_item as sale, cart_details.user as buyer, sale_details.sale_price as transaction_price,  cart_details.cart_qty as txn_qty from cart_details, sale_details where cart_details.sale_item = sale_details.sale_id and user = ?", [user_id], function(results) {
		results.forEach(function(purchase) {
			dao.insertData("txn_details", purchase, function(rows) {
				if(rows.affectedRows === 1) {
					logger.logUserCheckout(user_id, purchase.sale, purchase.txn_qty, purchase.transaction_price);
					dao.executeQuery("select sale_qty from sale_details where sale_id = ?", [purchase.sale], function(results) {
						var remaining_qty = Number(results[0].sale_qty) - Number(purchase.txn_qty);
						dao.executeQuery("update sale_details set sale_qty = ? where sale_id = ?", [remaining_qty, purchase.sale], function(results) {
							if(remaining_qty === 0) {
								dao.executeQuery("update sale_details set active = 0 where sale_id = ?", [purchase.sale], function(results) {
									// Do nothing
								});
							}
						});
					});
				} else {
					success = false;
				}
			});
		});
	});
	if(success) {
		dao.executeQuery("delete from cart_details where user = ?", [user_id], function(results) {
			res.send({
				"status_code" : 200
			});
		});
	}
};

module.exports.sendCartAvailability = function(user_id, res) {
	logger.logEntry("cart_bo", "sendCartAvailability");
	var available = true;
	dao.executeQuery("select sale_details.sale_qty as available_qty, cart_details.cart_qty from sale_details, cart_details where cart_details.sale_item = sale_details.sale_id and cart_details.user = ?", [user_id], function(results) {
		for(var i = 0; i < results.length; i++) {
			if(Number(results[i].available_qty) < Number(results[i].cart_qty)) {
				available = false;
			}
		}
	});
	res.send({
		"available"	:	available
	});
};

module.exports.removeFromCart = function(user_id, item_id, res) {
	logger.logEntry("cart_bo", "removeFromCart");
	dao.executeQuery("delete from cart_details where user = ? and sale_item = ?", [user_id, item_id], function(results) {
		logger.logUserCartRemove(user_id, item_id);
		res.send({ });
	});
};