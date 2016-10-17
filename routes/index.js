
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
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "GET", "/");
	} else {
		logger.logRouteEntry(0, "GET", "/");
	}
	homepage_bo.homepage(res);
});

router.get('/account', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "GET", "/account");
	} else {
		logger.logRouteEntry(0, "GET", "/account");
	}
	accounts_bo.accounts(res);
});

router.get('/sell', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "GET", "/sell");
	} else {
		logger.logRouteEntry(0, "GET", "/sell");
	}
	sell_bo.sell(res);
});

router.get('/cart', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "GET", "/cart");
	} else {
		logger.logRouteEntry(0, "GET", "/cart");
	}
	if(req.session.loggedInUser) {
		cart_bo.cart(res);
	} else {
		res.redirect('/');
	}
});

router.get('/viewItem', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "GET", "/viewItem");
		item_bo.addItemToUserSuggestion(req.session.loggedInUser.user_id, Number(req.param('itemid')));
	} else {
		logger.logRouteEntry(0, "GET", "/viewItem");
	}
	item_bo.item(res);
	
});

router.get('/forgotPassword', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "GET", "/forgotPassword");
	} else {
		logger.logRouteEntry(0, "GET", "/forgotPassword");
	}
	accounts_bo.handleForgotRequest(req.param('email'), res);
});

router.post('/placeBid', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/placeBid");
		item_bo.placeUserBid(req.session.loggedInUser.user_id, req.body.bid_item, req.body.bid_price, req.body.bid_qty, res);
	} else {
		logger.logRouteEntry(0, "POST", "/placeBid");
		res.send({
			"status_code"	:	301
		});
	}
});

router.post('/emailIDAvailable', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/emailIDAvailable");
	} else {
		logger.logRouteEntry(0, "POST", "/emailIDAvailable");
	}
	accounts_bo.checkEmailAvailability(req.body.email, res);
});

router.post('/fetchBidDetails', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/fetchBidDetails");
	} else {
		logger.logRouteEntry(0, "POST", "/fetchBidDetails");
	}
	item_bo.sendBidDetails(req.body.itemid, res);
});

router.post('/updateContact', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/updateContact");
	} else {
		logger.logRouteEntry(0, "POST", "/updateContact");
	}
	profile_bo.updateUserContact(req.body.user, req.body.contact, res);
});

router.post('/updateDOB', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/updateDOB");
	} else {
		logger.logRouteEntry(0, "POST", "/updateDOB");
	}
	profile_bo.updateUserDOB(req.body.user, req.body.dob, res);
});

router.post('/fetchUserProfile', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/fetchUserProfile");
		profile_bo.sendUserProfile(req.session.loggedInUser.user_id, req.body.username, res);
	} else {
		logger.logRouteEntry(0, "POST", "/fetchUserProfile");
		profile_bo.sendUserProfile(0, req.body.username, res);
	}
});

router.post('/fetchSoldByUser', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/fetchSoldByUser");
	} else {
		logger.logRouteEntry(0, "POST", "/fetchSoldByUser");
	}
	profile_bo.sendUserSoldItems(req.body.user, res);
});

router.post('/fetchBoughtByUser', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/fetchBoughtByUser");
	} else {
		logger.logRouteEntry(0, "POST", "/fetchBoughtByUser");
	}
	profile_bo.sendUserBoughtItems(req.body.user, res);
});

router.post('/fetchSaleByUser', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/fetchSaleByUser");
	} else {
		logger.logRouteEntry(0, "POST", "/fetchSaleByUser");
	}
	profile_bo.sendUserSaleItems(req.body.user, res);
});

router.post('/usernameAvailable', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/usernameAvailable");
	} else {
		logger.logRouteEntry(0, "POST", "/usernameAvailable");
	}
	accounts_bo.checkUserAvailability(sjcl.decrypt(req.body.passwordpassword, req.body.username), res);
});

router.post('/loggedInUser', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/loggedInUser");
		common_bo.sendLoggedInUser(req, res);
	} else {
		logger.logRouteEntry(0, "POST", "/loggedInUser");
		res.send({
			"userBO"	:	{}
		});
	}
});

router.post('/checkCartQtyAvailable', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/checkCartQtyAvailable");
		cart_bo.sendCartAvailability(req.session.loggedInUser.user_id, res);
	} else {
		logger.logRouteEntry(0, "POST", "/checkCartQtyAvailable");
		res.redirect('/');
	}
});

router.post('/fetchAddresses', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/fetchAddresses");
	} else {
		logger.logRouteEntry(0, "POST", "/fetchAddresses");
	}
	common_bo.sendAddresses(req.body.user, res);
});

router.post('/checkout', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/checkout");
		cart_bo.checkout(req.session.loggedInUser.user_id, res);
	} else {
		logger.logRouteEntry(0, "POST", "/checkout");
		res.redirect('/');
	}
});

router.post('/addAddress', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/addAddress");
	} else {
		logger.logRouteEntry(0, "POST", "/addAddress");
	}
	profile_bo.addUserAddress(req.body.user_id, req.body.st_address, req.body.apt, req.body.city, req.body.state, req.body.country, req.body.zip, res);
});

router.post('/fetchItemDetails', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/fetchItemDetails");
	} else {
		logger.logRouteEntry(0, "POST", "/fetchItemDetails");
	}
	item_bo.sendItemDetails(req.body.itemid, res);
});

router.post('/fetchTransactions', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/fetchTransactions");
	} else {
		logger.logRouteEntry(0, "POST", "/fetchTransactions");
	}
	item_bo.sendTotalSold(req.body.itemid, res);
});

router.post('/fetchCart', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/fetchCart");
		common_bo.sendUserCartItems(req.session.loggedInUser.user_id, res);
	} else {
		logger.logRouteEntry(0, "POST", "/fetchCart");
		common_bo.sendCartItems(res);
	}
});

router.post('/removeFromCart', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/removeFromCart");
		cart_bo.removeFromCart(req.session.loggedInUser.user_id, req.body.item, res);
	} else {
		logger.logRouteEntry(0, "POST", "/removeFromCart");
		res.redirect('/');
	}
});

router.post('/fetchNotifications', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/fetchNotifications");
		common_bo.sendUserNotifications(req.session.loggedInUser.user_id, res);
	} else {
		logger.logRouteEntry(0, "POST", "/fetchNotifications");
		common_bo.sendNotifications(res);
	}
});

router.post('/addToCart', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/addToCart");
		item_bo.addItemToCart(req.session.loggedInUser.user_id, req.body.itemid, req.body.qty, res);
	} else {
		logger.logRouteEntry(0, "POST", "/addToCart");
		res.send({
			"status_code"	:	301
		});
	}
});

router.post('/fetchSales', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/fetchSales");
		homepage_bo.sendUserSaleListing(req.session.loggedInUser.user_id, res);
	} else {
		logger.logRouteEntry(0, "POST", "/fetchSales");
		homepage_bo.sendSaleListing(res);
	}
});

router.post('/searchSales', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/searchSales");
		homepage_bo.sendUserSearchResults(req.body.searchString, req.session.loggedInUser.user_id, res);
	} else {
		logger.logRouteEntry(0, "POST", "/searchSales");
		homepage_bo.sendSearchResults(req.body.searchString, res);
	}
});

router.post('/fetchSuggestions', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/fetchSuggestions");
		homepage_bo.sendUserSuggestions(req.session.loggedInUser.user_id, res);
	} else {
		logger.logRouteEntry(0, "POST", "/fetchSuggestions");
		homepage_bo.sendSuggestions(res);
	}
});

router.post('/fetchItems', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/fetchItems");
	} else {
		logger.logRouteEntry(0, "POST", "/fetchItems");
	}
	sell_bo.sendItems(res);
});

router.post('/fetchConditions', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/fetchConditions");
	} else {
		logger.logRouteEntry(0, "POST", "/fetchConditions");
	}
	sell_bo.sendConditions(res);
});

router.post('/register', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/register");
	} else {
		logger.logRouteEntry(0, "POST", "/register");
	}
	accounts_bo.register(sjcl.decrypt(req.body.passwordpassword, req.body.username), 
			req.body.email, sjcl.decrypt(req.body.passwordpassword, req.body.password), 
			req.body.fname, req.body.lname, req.body.contact, res);
});

router.post('/publishSale', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/publishSale");
		sell_bo.publishSale(req.session.loggedInUser.user_id, req.body.advertise_title, req.body.advertise_item, 
				req.body.advertise_condition, req.body.advertise_is_bid, req.body.advertise_price, 
				req.body.advertise_quantity, req.body.advertise_desc, res);
	} else {
		logger.logRouteEntry(0, "POST", "/publishSale");
		res.redirect('/');
	}
});

router.post('/signoutUser', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/signoutUser");
	} else {
		logger.logRouteEntry(0, "POST", "/signoutUser");
	}
	if(req.session) {
		logger.logUserSignout(req.session.loggedInUser.user_id);
		common_bo.destroySession(req, res);
	}
});

router.post('/signin', function(req, res, next) {
	if(req.session.loggedInUser) {
		logger.logRouteEntry(req.session.loggedInUser.user_id, "POST", "/signin");
	} else {
		logger.logRouteEntry(0, "POST", "/signin");
	}
	accounts_bo.signin(sjcl.decrypt(req.body.passwordpassword, req.body.userID), sjcl.decrypt(req.body.passwordpassword, req.body.password), req, res);
});

module.exports = router;
