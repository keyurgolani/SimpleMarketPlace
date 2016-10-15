var express = require('express');
var router = express.Router();
var dao = require('../utils/dao');
var logger = require("../utils/logger");
var schedule = require('node-schedule');
var sjcl = require('sjcl');

var common_bo = require('../bos/common_bo');
var homepage_bo = require('../bos/homepage_bo');
var accounts_bo = require('../bos/accounts_bo');
var sell_bo = require('../bos/sell_bo');
var cart_bo = require('../bos/cart_bo');
var profile_bo = require('../bos/profile_bo');
var item_bo = require('../bos/item_bo');

// TODO: Nice Utility for scheduled tasks: https://github.com/ncb000gt/node-cron -- Done
// TODO: Nice tool for scheduling bid end job: https://github.com/node-schedule/node-schedule -- Done

router.get('/', function(req, res, next) {
	homepage_bo.homepage(res);
});

router.get('/account', function(req, res, next) {
	accounts_bo.accounts(res);
});

router.get('/sell', function(req, res, next) {
	res.render('sell', {  });
});

router.get('/cart', function(req, res, next) {
	if(req.session.loggedInUser) {
		res.render('cart', {  });
	} else {
		res.redirect('/');
	}
});

router.get('/viewItem', function(req, res, next) {
	if(req.session.loggedInUser) {
		item_bo.addItemToUserSuggestion(req.session.loggedInUser.user_id, Number(req.param('itemid')));
	}
	res.render('viewItem', {  });
});

router.post('/placeBid', function(req, res, next) {
	if(req.session.loggedInUser) {
		item_bo.placeUserBid(req.session.loggedInUser.user_id, req.body.bid_item, req.body.bid_price, req.body.bid_qty, res);
	} else {
		res.send({
			"status_code"	:	301
		});
	}
});

router.post('/emailIDAvailable', function(req, res, next) {
	accounts_bo.checkEmailAvailability(req.body.email, res);
});

router.post('/fetchBidDetails', function(req, res, next) {
	item_bo.sendBidDetails(req.body.itemid, res);
});

router.post('/updateContact', function(req, res, next) {
	profile_bo.updateUserContact(req.body.user, req.body.contact, res);
});

router.post('/updateDOB', function(req, res, next) {
	profile_bo.updateUserDOB(req.body.user, req.body.dob, res);
});

router.post('/fetchUserProfile', function(req, res, next) {
	profile_bo.sendUserProfile(req.body.username, res);
});

router.post('/fetchSoldByUser', function(req, res, next) {
	profile_bo.sendUserSoldItems(req.body.user, res);
});

router.post('/fetchBoughtByUser', function(req, res, next) {
	profile_bo.sendUserBoughtItems(req.body.user, res);
});

router.post('/fetchSaleByUser', function(req, res, next) {
	profile_bo.sendUserSaleItems(req.body.user, res);
});

router.post('/usernameAvailable', function(req, res, next) {
	accounts_bo.checkUserAvailability(sjcl.decrypt(req.body.passwordpassword, req.body.username), res);
});

router.post('/loggedInUser', function(req, res, next) {
	if(req.session.loggedInUser) {
		common_bo.sendLoggedInUser(req, res);
	} else {
		res.send({
			"userBO"	:	{}
		});
	}
});

router.post('/fetchAddresses', function(req, res, next) {
	common_bo.sendAddresses(req.body.user, res);
});

router.post('/checkout', function(req, res, next) {
	if(req.session.loggedInUser) {
		cart_bo.checkout(req.session.loggedInUser.user_id);
	} else {
		res.redirect('/');
	}
});

router.post('/addAddress', function(req, res, next) {
	profile_bo.addUserAddress(req.body.user_id, req.body.st_address, req.body.apt, req.body.city, req.body.state, req.body.country, req.body.zip, res);
});

router.post('/fetchItemDetails', function(req, res, next) {
	item_bo.sendItemDetails(req.body.itemid, res);
});

router.post('/fetchTransactions', function(req, res, next) {
	item_bo.sendTotalSold(req.body.itemid, res);
});

router.post('/fetchCart', function(req, res, next) {
	if(req.session.loggedInUser) {
		common_bo.sendUserCartItems(req.session.loggedInUser.user_id, res);
	} else {
		common_bo.sendCartItems(res);
	}
});

router.post('/removeFromCart', function(req, res, next) {
	if(req.session.loggedInUser) {
		cart_bo.removeFromCart(req.session.loggedInUser.user_id, req.body.item, res);
	} else {
		res.redirect('/');
	}
});

router.post('/fetchNotifications', function(req, res, next) {
	if(req.session.loggedInUser) {
		common_bo.sendUserNotifications(req.session.loggedInUser.user_id, res);
	} else {
		common_bo.sendNotifications(res);
	}
});

router.post('/addToCart', function(req, res, next) {
	if(req.session.loggedInUser) {
		item_bo.addItemToCart(req.session.loggedInUser.user_id, req.body.itemid, req.body.qty, res);
	} else {
		res.send({
			"status_code"	:	301
		});
	}
});

router.post('/fetchSales', function(req, res, next) {
	if(req.session.loggedInUser) {
		homepage_bo.sendUserSaleListing(req.session.loggedInUser.user_id, res);
	} else {
		homepage_bo.sendSaleListing(res);
	}
});

router.post('/searchSales', function(req, res, next) {
	if(req.session.loggedInUser) {
		homepage_bo.sendUserSearchResults(req.body.searchString, req.session.loggedInUser.user_id, res);
	} else {
		homepage_bo.sendSearchResults(req.body.searchString, res);
	}
});

router.post('/fetchSuggestions', function(req, res, next) {
	if(req.session.loggedInUser) {
		homepage_bo.sendUserSuggestions(req.session.loggedInUser.user_id, res);
	} else {
		homepage_bo.sendSuggestions(res);
	}
});

router.post('/fetchItems', function(req, res, next) {
	sell_bo.sendItems(res);
});

router.post('/fetchConditions', function(req, res, next) {
	sell_bo.sendConditions(res);
});

router.post('/register', function(req, res, next) {
	var username = sjcl.decrypt(req.body.passwordpassword, req.body.username);
	var email = req.body.email;
	var secret = sjcl.decrypt(req.body.passwordpassword, req.body.password);
	var firstname = req.body.fname;
	var lastname = req.body.lname;
	var phone = req.body.contact;
	accounts_bo.register(username, email, secret, firstname, lastname, phone, res);
});

router.post('/publishSale', function(req, res, next) {
	var title = req.body.advertise_title;
	var item = req.body.advertise_item;
	var condition = req.body.advertise_condition;
	var is_bid = req.body.advertise_is_bid;
	var price = req.body.advertise_price;
	var quantity = req.body.advertise_quantity;
	var description = req.body.advertise_desc;
	sell_bo.publishSale(title, item, condition, is_bid, price, quantity, description, res);
});

router.get('/forgotPassword', function(req, res, next) {
	var error_messages = [];
	var status_code = 200;
	var success_messages = [];
	logger.log("info", "Forgot Password form");
	var email = req.param('email'); 
	var email_validator = new RegExp("^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,24})$");
	if(email.match(email_validator) !== null) {
		dao.fetchData("count(user_id) as matches", "user_account", {
			"email"	:	email
		}, function(rows) {
			if(Number(rows[0].matches) > 0) {
				// TODO: Send an email to 
			} else {
				error_messages.push("Email ID not found in our records.");
				status_code = 400;
			}
		});
	} else {
		error_messages.push("Not valid Email ID");
		status_code = 400;
	}
});

router.post('/signoutUser', function(req, res, next) {
	if(req.session) {
		common_bo.destroySession(req, res);
	}
});

router.post('/signin', function(req, res, next) {
	var passwordpassword = req.body.passwordpassword;
	var username = sjcl.decrypt(req.body.passwordpassword, req.body.userID);
	var password = sjcl.decrypt(req.body.passwordpassword, req.body.password);
	accounts_bo.signin(username, password, req, res);
});

module.exports = router;
