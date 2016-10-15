
var dao = require('../utils/dao');

module.exports.checkout = function(user_id, res) {
	var success = true;
	dao.executeQuery("select cart_details.sale_item as sale, cart_details.user as buyer, sale_details.sale_price as transaction_price,  cart_details.cart_qty as txn_qty from cart_details, sale_details where cart_details.sale_item = sale_details.sale_id and user = ?", [user_id], function(results) {
		results.forEach(function(purchase) {
			dao.insertData("txn_details", purchase, function(rows) {
				if(rows.affectedRows === 1) {
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

module.exports.removeFromCart = function(user_id, item_id, res) {
	dao.executeQuery("delete from cart_details where user = ? and sale_item = ?", [user_id, item_id], function(results) {
		res.send({ });
	});
};