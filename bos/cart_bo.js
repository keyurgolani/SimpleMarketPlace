
var mongoDao = require('../utils/mongoDao');
var logger = require("../utils/logger");

module.exports.cart = function(res) {
	logger.logEntry("cart_bo", "cart");
	res.render('cart', {});
};

module.exports.checkout = function(user_id, req, res) {
	logger.logEntry("cart_bo", "checkout");
	var success = true;
	mongoDao.fetchOne('UserDetails', {
		'_id'	:	user_id
	}, function(user) {
		for(var i = 0; i < user.cart.length; i++) {
			mongoDao.insert('TransactionDetails', {
				'item'	:	user.cart[i],
				'buyer'	:	user._id,
				'time'	:	new Date().getTime()
			}, function(resultDoc) {
				mongoDao.update('SaleDetails', {
					'_id'	:	resultDoc.ops[0].item._id
				}, {
					'$inc'	:	{
						'sale_qty'	:	-resultDoc.ops[0].item.sale_qty
					}
				});
			});
		}
	});
	setTimeout(function() {
		if(success) {
			req.session.loggedInUser.cart = [];
			mongoDao.update('UserDetails', {
				'_id' : user_id
			}, {
				'$set'	:	{
					'cart'	:	[]
				}
			}, function(resultDoc) {
				res.send({
					"status_code" : 200
				});
			});
		}
	}, 0);
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

module.exports.removeFromCart = function(user_id, item_id, req, res) {
	logger.logEntry("cart_bo", "removeFromCart");
	var cartSize = req.session.loggedInUser.cart.length;
	for(var i = 0; i < cartSize; i++) {
		if(req.session.loggedInUser.cart[i]._id == item_id) {
			req.session.loggedInUser.cart.splice(i, 1);
			cartSize--;
			i--;
		}
	}
	mongoDao.update('UserDetails', {
		'_id' : user_id
	}, {
		$pull : {
			'cart' : {
				"_id"		:	item_id
			}
		}
	}, function(resultDoc) {
		logger.logUserCartRemove(user_id, item_id);
		res.send({ });
	})
};