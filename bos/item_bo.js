
var dao = require('../utils/dao');

module.exports.item = function(res) {
	res.render('viewItem', {});
};

module.exports.sendBidDetails = function(sale_id, res) {
	dao.executeQuery("SELECT bid.*, bidder.user_name FROM bid_details AS bid, user_account AS bidder WHERE bid.bidder = bidder.user_id AND sale = ? order by bid.bid_amount desc", [sale_id], function(results) {
		dao.executeQuery("select sale_time from sale_details where sale_id = ?", [sale_id], function(sale_time) {
			var saleDate = new Date(sale_time[0].sale_time);
			var bidEnd = Math.abs(saleDate.getTime() + 345600000);
			res.send({
				"results"		:	results,
				"futureTime"	:	new Date(bidEnd)
			});
		});
	});
};

module.exports.sendItemDetails = function(sale_id, res) {
	dao.executeQuery("select is_bid from sale_details where sale_id = ?", [sale_id], function(results) {
		if(results[0].is_bid) {
			dao.executeQuery("select active from sale_details where sale_id = ?", [sale_id], function(activeStatus) {
				if(activeStatus[0].active === 1) {
					dao.executeQuery("SELECT sale.*, seller.f_name, seller.l_name, seller.user_name, seller.user_id, cond.condition_name FROM sale_details AS sale, user_account AS seller, item_conditions AS cond WHERE sale.condition = cond.condition_id AND sale.seller = seller.user_id AND sale_id = ?", [sale_id], function(results) {
						res.send({
							"item_id" : results[0].sale_id,
							"item_title" : results[0].title,
							"item_description" : results[0].description,
							"item_condition" : results[0].condition_name,
							"available_quantity" : results[0].sale_qty,
							"is_bid" : results[0].is_bid,
							"current_price" : results[0].sale_price,
							"item_seller_fname" : results[0].f_name,
							"item_seller_lname" : results[0].l_name,
							"item_seller_handle" : results[0].user_name,
							"item_seller_id" : results[0].user_id
						});
					});
				} else {
					res.send({
						"item_id"	:	-1
					});
				}
			});
		} else {
			dao.executeQuery("SELECT sale.*, seller.f_name, seller.l_name, seller.user_name, seller.user_id, cond.condition_name FROM sale_details AS sale, user_account AS seller, item_conditions AS cond WHERE sale.condition = cond.condition_id AND sale.seller = seller.user_id AND sale_id = ?", [sale_id], function(results) {
				res.send({
					"item_id" : results[0].sale_id,
					"item_title" : results[0].title,
					"item_description" : results[0].description,
					"item_condition" : results[0].condition_name,
					"available_quantity" : results[0].sale_qty,
					"is_bid" : results[0].is_bid,
					"current_price" : results[0].sale_price,
					"item_seller_fname" : results[0].f_name,
					"item_seller_lname" : results[0].l_name,
					"item_seller_handle" : results[0].user_name,
					"item_seller_id" : results[0].user_id
				});
			});
		}
	});
};

module.exports.placeUserBid = function(user_id, item_id, bid_price, bid_qty, res) {
	dao.insertData("bid_details", {
		"sale"			:	item_id,
		"bidder"		:	user_id,
		"bid_amount"	:	bid_price,
		"bid_qty"		:	bid_qty
	}, function(rows) {
		dao.executeQuery("update sale_details set sale_price = ? where sale_id = ?", [bid_price, item_id], function() {
			res.send({
				"status_code"	:	200
			});
		});
	});
};

module.exports.addItemToCart = function(user_id, item_id, qty, res) {
	dao.executeQuery("SELECT count(cart_item_id) as entries FROM cart_details WHERE user = ? AND sale_item = ?", [user_id, item_id], function(results) {
		if(results[0].entries > 0) {
			dao.executeQuery("UPDATE cart_details SET `cart_qty` = ? WHERE `user` = ? AND `sale_item` = ?", [Number(results[0].entries) + Number(qty), user_id, item_id], function(update_status) {
				if(update_status.affectedRows === 1) {
					res.send({
						"status_code"	:	200
					});
				} else {
					res.send({
						"status_code"	:	500
					});
				}
			});
		} else {
			dao.insertData("cart_details", {
				"user"		:	user_id,
				"sale_item"	:	item_id,
				"cart_qty"	:	qty
			}, function(rows) {
				if(rows.affectedRows === 1) {
					res.send({
						"status_code"	:	200
					});
				} else {
					res.send({
						"status_code"	:	500
					});
				}
			});
		}
	});
};

module.exports.sendTotalSold = function(item_id, res) {
	dao.executeQuery("select sum(txn_id) as totalCount from txn_details where sale = ?", [item_id], function(results) {
		res.send({
			"total_sold" : results[0].totalCount
		});
	});
};

module.exports.addItemToUserSuggestion = function(user_id, item_id) {
	dao.executeQuery("SELECT count(suggestion_id) as entries FROM suggestion_details WHERE user = ? AND suggestion_item = ?", [user_id, item_id], function(rows) {
		if(rows.entries !== 0) {
			dao.executeQuery("DELETE FROM suggestion_details WHERE user=? AND suggestion_item=?", [user_id, item_id], function(suggestionDetails) {
				dao.insertData("suggestion_details", {
					"user"				:	user_id,
					"suggestion_item"	:	item_id
				}, function(rows) {
					// Do nothing
				});
			});
		} else {
			dao.insertData("suggestion_details", {
				"user"				:	user_id,
				"suggestion_item"	:	item_id
			}, function(rows) {
				// Do nothing
			});
		}
	});
};