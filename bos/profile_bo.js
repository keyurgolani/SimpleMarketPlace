
var dao = require('../utils/dao');

module.exports.sendUserSoldItems = function(user_id, res) {
	dao.executeQuery("select sale_details.title, txn_details.txn_qty, txn_details.transaction_price, txn_details.txn_time from txn_details, sale_details where txn_details.sale = sale_details.sale_id and sale_details.seller = ?", [user_id], function(soldItems) {
		res.send({
			"soldItems"	:	soldItems
		});
	});
};

module.exports.sendUserBoughtItems = function(user_id, res) {
	dao.executeQuery("select sale_details.title, txn_details.txn_qty, txn_details.transaction_price, txn_details.txn_time from txn_details, sale_details where txn_details.sale = sale_details.sale_id and txn_details.buyer = ?", [user_id], function(boughtItems) {
		res.send({
			"boughtItems"	:	boughtItems
		});
	});
};

module.exports.sendUserSaleItems = function(user_id, res) {
	dao.executeQuery("select title, sale_price, sale_qty, description, sale_time from sale_details where seller = ? and active=1;", [user_id], function(saleItems) {
		res.send({
			"saleItems"	:	saleItems
		});
	});
};

module.exports.updateUserContact = function(user_id, contact, res) {
	dao.updateData("user_profile", {
		"contact"	:	contact
	}, {
		"user"	:	user_id
	}, function(update_status) {
		dao.executeQuery("select contact from user_profile where user = ?", [user_id], function(profile_details) {
			res.send({
				"contact"		:	profile_details[0].contact
			});
		});
	});
};

module.exports.updateUserContact = function(user_id, dob, res) {
	dao.updateData("user_profile", {
		"dob"	:	dob
	}, {
		"user"	:	user_id
	}, function(update_status) {
		dao.executeQuery("select dob from user_profile where user = ?", [user_id], function(profile_details) {
			res.send({
				"dob"		:	profile_details[0].dob
			});
		});
	});
};

module.exports.addUserAddress = function(user_id, st_address, apt, city, state, country, zip, res) {
	dao.fetchData("profile_id", "user_profile", {
		"user"	:	user_id
	}, function(profile_ids) {
		dao.insertData("location_details", {
			"st_address"		:	st_address,
			"apt"		:	apt,
			"city"		:	city,
			"state"		:	state,
			"country"	:	country,
			"zip"		:	zip,
			"profile"	:	profile_ids[0].profile_id
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
	});
};

module.exports.sendUserProfile = function(user_name, res) {
	dao.executeQuery("select user_name, f_name, l_name, user_id from user_account where user_name = ?", [user_name], function(userProfile) {
		dao.executeQuery("select contact, dob from user_profile where user = ?", [userProfile[0].user_id], function(profile_details) {
			res.send({
				"user_id"		:	userProfile[0].user_id,
				"user_name"		:	userProfile[0].user_name,
				"lname"			:	userProfile[0].l_name,
				"fname"			:	userProfile[0].f_name,
				"contact"		:	profile_details[0].contact,
				"dob"			:	profile_details[0].dob
			});
		});
	});
};