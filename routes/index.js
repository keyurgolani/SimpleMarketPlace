var express = require('express');
var router = express.Router();
var dao = require('../utils/dao');
var logger = require("../utils/logger");
var schedule = require('node-schedule');
var sjcl = require('sjcl');

// TODO: Nice Utility for scheduled tasks: https://github.com/ncb000gt/node-cron -- Done
// TODO: Nice tool for scheduling bid end job: https://github.com/node-schedule/node-schedule -- Done

router.get('/', function(req, res, next) {
	res.render('index', {  });
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
		dao.executeQuery("SELECT count(suggestion_id) as entries FROM suggestion_details WHERE user = ? AND suggestion_item = ?", [req.session.loggedInUser.user_id, Number(req.param('itemid'))], function(rows) {
			if(rows.entries !== 0) {
				dao.executeQuery("DELETE FROM suggestion_details WHERE user=? AND suggestion_item=?", [req.session.loggedInUser.user_id, Number(req.param('itemid'))], function(suggestionDetails) {
					dao.insertData("suggestion_details", {
						"user"				:	req.session.loggedInUser.user_id,
						"suggestion_item"	:	Number(req.param('itemid'))
					}, function(rows) {
						// Do nothing
					});
				});
			} else {
				dao.insertData("suggestion_details", {
					"user"				:	req.session.loggedInUser.user_id,
					"suggestion_item"	:	Number(req.param('itemid'))
				}, function(rows) {
					// Do nothing
				});
			}
		});
	}
	res.render('viewItem', {  });
});

router.post('/placeBid', function(req, res, next) {
	if(req.session.loggedInUser) {
		dao.insertData("bid_details", {
			"sale"			:	req.body.bid_item,
			"bidder"		:	req.session.loggedInUser.user_id,
			"bid_amount"	:	req.body.bid_price,
			"bid_qty"		:	req.body.bid_qty
		}, function(rows) {
			dao.executeQuery("update sale_details set sale_price = ? where sale_id = ?", [req.body.bid_price, req.body.bid_item], function() {
				res.send({
					"status_code"	:	200
				});
			});
		});
	} else {
		res.send({
			"status_code"	:	301
		});
	}
});

router.post('/emailIDAvailable', function(req, res, next) {
	dao.executeQuery("SELECT COUNT(email) as count FROM user_account WHERE email like ?", [req.body.email], function(result) {
		if(result[0].count === 0) {
			res.send({
				"available"	:	true
			});
		} else {
			res.send({
				"available"	:	false
			});
		}
	});
});

router.post('/fetchBidDetails', function(req, res, next) {
	dao.executeQuery("SELECT bid.*, bidder.user_name FROM bid_details AS bid, user_account AS bidder WHERE bid.bidder = bidder.user_id AND sale = ? order by bid.bid_amount desc", [req.body.itemid], function(results) {
		dao.executeQuery("select sale_time from sale_details where sale_id = ?", [req.body.itemid], function(remainingTime) {
			var saleDate = new Date(remainingTime[0].sale_time);
			var bidEnd = Math.abs(saleDate.getTime() + 345600000);
			res.send({
				"results"		:	results,
				"futureTime"	:	new Date(bidEnd)
			});
		});
	});
});

router.post('/updateContact', function(req, res, next) {
	dao.updateData("user_profile", {
		"contact"	:	req.body.contat
	}, {
		"user"	:	req.body.user
	}, function(update_status) {
		dao.executeQuery("select contact from user_profile where user = ?", [req.body.user], function(profile_details) {
			res.send({
				"contact"		:	profile_details[0].contact
			});
		});
	});
});

router.post('/updateDOB', function(req, res, next) {
	dao.updateData("user_profile", {
		"dob"	:	req.body.dob
	}, {
		"user"	:	req.body.user
	}, function(update_status) {
		dao.executeQuery("select dob from user_profile where user = ?", [req.body.user], function(profile_details) {
			res.send({
				"dob"		:	profile_details[0].dob
			});
		});
	});
});

router.post('/fetchUserProfile', function(req, res, next) {
	var user_id;
	var user_name;
	var lname;
	var fname;
	var sold_count;
	var bought_count;
	var sale_count;
	var contact;
	var dob;
	dao.executeQuery("select user_name, f_name, l_name, user_id from user_account where user_name = ?", [req.body.username], function(userProfile) {
		user_id = userProfile[0].user_id;
		user_name = userProfile[0].user_name;
		fname = userProfile[0].f_name;
		lname = userProfile[0].l_name;
		dao.executeQuery("select count(txn_id) as soldCount from txn_details where sale in (select sale_id from sale_details where seller = ?)", [userProfile[0].user_id], function(soldCount) {
			sold_count = soldCount[0].soldCount;
			dao.executeQuery("select count(txn_id) as boughtCount from txn_details where buyer = ?", [userProfile[0].user_id], function(boughtCount) {
				bought_count = boughtCount[0].boughtCount;
				dao.executeQuery("select count(sale_id) as saleCount from sale_details where seller = ?", [userProfile[0].user_id], function(saleCount) {
					sale_count = saleCount[0].saleCount;
					dao.executeQuery("select contact, dob from user_profile where user = ?", [userProfile[0].user_id], function(profile_details) {
						if(profile_details.length) {
							contact = profile_details[0].contact;
							dob = profile_details[0].dob;
						}
						res.send({
							"user_id"		:	user_id,
							"user_name"		:	user_name,
							"lname"			:	lname,
							"fname"			:	fname,
							"sold_count"	:	sold_count,
							"bought_count"	:	bought_count,
							"sale_count"	:	sale_count,
							"contact"		:	contact,
							"dob"			:	dob
						});
					});
				});
			});
		});
	});
});

router.post('/usernameAvailable', function(req, res, next) {
	dao.executeQuery("SELECT COUNT(user_name) as count FROM user_account WHERE user_name like ?", [sjcl.decrypt(req.body.passwordpassword, req.body.username)], function(result) {
		if(result[0].count === 0) {
			res.send({
				"available"	:	true
			});
		} else {
			res.send({
				"available"	:	false
			});
		}
	});
});

router.post('/loggedInUser', function(req, res, next) {
	if(req.session.loggedInUser) {
		res.send({
			"userBO"	:	req.session.loggedInUser
		});
	} else {
		res.send({
			"userBO"	:	{}
		});
	}
});

router.post('/fetchItemDetails', function(req, res, next) {
	dao.executeQuery("select is_bid from sale_details where sale_id = ?", [req.body.itemid], function(results) {
		if(results[0].is_bid) {
			dao.executeQuery("select active from sale_details where sale_id = ?", [req.body.itemid], function(activeStatus) {
				if(activeStatus[0].active === 1) {
					dao.executeQuery("SELECT sale.*, seller.f_name, seller.l_name, seller.user_name, seller.user_id, cond.condition_name FROM sale_details AS sale, user_account AS seller, item_conditions AS cond WHERE sale.condition = cond.condition_id AND sale.seller = seller.user_id AND sale_id = ?", [req.body.itemid], function(results) {
						res.send({
							"item_id" : results[0].sale_id,
							"item_title" : results[0].title,
							"item_description" : results[0].desc,
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
			dao.executeQuery("SELECT sale.*, seller.f_name, seller.l_name, seller.user_name, seller.user_id, cond.condition_name FROM sale_details AS sale, user_account AS seller, item_conditions AS cond WHERE sale.condition = cond.condition_id AND sale.seller = seller.user_id AND sale_id = ?", [req.body.itemid], function(results) {
				res.send({
					"item_id" : results[0].sale_id,
					"item_title" : results[0].title,
					"item_description" : results[0].desc,
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
});

router.post('/fetchTransactions', function(req, res, next) {
	dao.executeQuery("select sum(txn_id) as totalCount from txn_details where sale = ?", [req.body.itemid], function(results) {
		res.send({
			"total_sold" : results[0].totalCount
		});
	});
});

router.post('/fetchCart', function(req, res, next) {
	if(req.session.loggedInUser) {
		dao.executeQuery("SELECT seller.user_name, sale.sale_id, sale.title, condi.condition_name, cart.cart_qty, sale.sale_price FROM cart_details AS cart, sale_details AS sale, user_account AS seller, item_conditions AS condi WHERE condi.condition_id = sale.condition AND cart.sale_item = sale.sale_id AND seller.user_id = sale.seller AND cart.user = ?", [req.session.loggedInUser.user_id], function(results) {
			res.send({
				"cart_items" : results
			});
		});
	} else {
		res.send({
			"cart_items" : []
		});
	}
});

router.post('/removeFromCart', function(req, res, next) {
	if(req.session.loggedInUser) {
		dao.executeQuery("delete from cart_details where user = ? and sale_item = ?", [req.session.loggedInUser.user_id, req.body.item], function(results) {
			res.send({ });
		});
	} else {
		res.redirect('/');
	}
});

router.post('/fetchNotifications', function(req, res, next) {
	if(req.session.loggedInUser) {
		dao.executeQuery("SELECT * FROM notification_details WHERE user_id = ?", [req.session.loggedInUser.user_id], function(results) {
			res.send({
				"notifications" : results
			});
		});
	} else {
		res.send({
			"notifications" : []
		});
	}
});

router.post('/addToCart', function(req, res, next) {
	if(req.session.loggedInUser) {
		dao.executeQuery("SELECT count(cart_item_id) as entries FROM cart_details WHERE user = ? AND sale_item = ?", [req.session.loggedInUser.user_id, req.body.itemid], function(results) {
			if(results[0].entries > 0) {
				dao.executeQuery("UPDATE cart_details SET `cart_qty` = ? WHERE `user` = ? AND `sale_item` = ?", [Number(results[0].entries) + Number(req.body.qty), req.session.loggedInUser.user_id, req.body.itemid], function(update_status) {
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
					"user"		:	req.session.loggedInUser.user_id,
					"sale_item"	:	req.body.itemid,
					"cart_qty"	:	req.body.qty
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
		})
	} else {
		res.send({
			"status_code"	:	301
		});
	}
});

router.post('/fetchSales', function(req, res, next) {
	if(req.session.loggedInUser) {
		dao.executeQuery("SELECT user.user_name, sale.* FROM user_account as user, sale_details as sale WHERE seller = user_id AND seller <> ?", [req.session.loggedInUser.user_id], function(saleDetails) {
			res.send({
				"saleDetails"	:	saleDetails
			});
		});
	} else {
		dao.executeQuery("SELECT user.user_name, sale.* FROM user_account as user, sale_details as sale WHERE seller = user_id", [], function(saleDetails) {
			res.send({
				"saleDetails"	:	saleDetails
			});
		});
	}
});

router.post('/searchSales', function(req, res, next) {
	if(req.session.loggedInUser) {
		dao.executeQuery("SELECT loggedInuser.user_name, details.* FROM sale_details AS details, user_account AS loggedInuser WHERE details.seller = loggedInuser.user_id AND loggedInuser.user_id <> ? AND details.sale_id IN (SELECT sale_id FROM sale_details AS sale, user_account AS seller WHERE sale.seller = seller.user_id AND (sale.title LIKE ? OR seller.user_name LIKE ?))", [req.session.loggedInUser.user_id, '%' + req.body.searchString + '%', '%' + req.body.searchString + '%'], function(saleDetails) {
			res.send({
				"saleDetails"	:	saleDetails
			});
		});
	} else {
		dao.executeQuery("SELECT loggedInuser.user_name, details.* FROM sale_details AS details, user_account AS loggedInuser WHERE details.seller = loggedInuser.user_id AND details.sale_id IN (SELECT sale_id FROM sale_details AS sale, user_account AS seller WHERE sale.seller = seller.user_id AND (sale.title LIKE ? OR seller.user_name LIKE ?))", ['%' + req.body.searchString + '%', '%' + req.body.searchString + '%'], function(saleDetails) {
			res.send({
				"saleDetails"	:	saleDetails
			});
		});
	}
});

router.post('/fetchSuggestions', function(req, res, next) {
	if(req.session.loggedInUser) {
		dao.executeQuery("SELECT user.user_name, sale.* FROM user_account as user, sale_details as sale, suggestion_details as suggestions WHERE seller = user_id AND seller <> ? AND suggestions.user = ? AND suggestions.suggestion_item = sale.sale_id LIMIT 4", [req.session.loggedInUser.user_id, req.session.loggedInUser.user_id], function(suggestionDetails) {
			res.send({
				"suggestionDetails"	:	suggestionDetails
			});
		});
	} else {
		res.send({
			"saleDetails"	:	[]
		});
	}
});

router.post('/fetchItems', function(req, res, next) {
	dao.fetchData("*", "item_details", null, function(rows) {
		res.send({
			"result"	:	rows
		});
	});
});

router.post('/fetchConditions', function(req, res, next) {
	dao.fetchData("*", "item_conditions", null, function(rows) {
		res.send({
			"result"	:	rows
		});
	});
});

router.get('/account', function(req, res, next) {
	res.render('account', {  });
});

router.post('/register', function(req, res, next) {
	var error_messages = [];
	var status_code = 200;
	var success_messages = [];
	var username = sjcl.decrypt(req.body.passwordpassword, req.body.username);
	var email = req.body.email;
	var secret = sjcl.decrypt(req.body.passwordpassword, req.body.password);
	var firstname = req.body.fname;
	var lastname = req.body.lname;
	var phone = req.body.contact;
	var username_validator = new RegExp("^[a-z0-9_-]{3,16}$");
	// TODO: Password Validator for Angular: /^[a-z0-9_-]{6,18}$/ -- Done
	var email_validator = new RegExp("^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,24})$");
	var firstname_validator = new RegExp("^[a-zA-Z ,.'-]+$");
	var lastname_validator = new RegExp("^[a-zA-Z ,.'-]+$");
	var phone_validator = new RegExp(/^(\d{11,12})$/);
	// TODO: Input Mask for Phone Number: https://github.com/RobinHerbots/Inputmask -- Done
	// TODO: Continued: http://digitalbush.com/projects/masked-input-plugin/ -- Done
	// TODO: Continued: http://filamentgroup.github.io/politespace/demo/demo.html -- Done
	
	if(username.match(username_validator) === null) {
		logger.log("info", "Invalid username: " + username);
		error_messages.push("'" + username + "' is not a valid username.");
		status_code = 400;
	}
	
	if(email.match(email_validator) === null) {
		logger.log("info", "Invalid email: " + email);
		error_messages.push("'" + email + "' is not a valid email.");
		status_code = 400;
	}
	
	if(firstname.match(firstname_validator) === null) {
		logger.log("info", "Invalid firstname: " + firstname);
		error_messages.push("'" + firstname + "' is not a valid name.");
		status_code = 400;
	}
	
	if(lastname.match(lastname_validator) === null) {
		logger.log("info", "Invalid lastname: " + lastname);
		error_messages.push("'" + lastname + "' is not a valid name.");
		status_code = 400;
	}
	
	if(phone.match(phone_validator) === null) {
		logger.log("info", "Invalid phone: " + phone);
		error_messages.push("'" + phone + "' is not a valid phone.");
		status_code = 400;
	}
	if(status_code === 200) {
		logger.log("info", "Valid parameters");
		var insertParameters = {
				"user_name"	:	username,
				"f_name"	:	firstname,
				"l_name"	:	lastname,
				"email"		:	email,
				"secret"	:	secret,
				"last_login":	require('fecha').format(Date.now(),'YYYY-MM-DD HH:mm:ss')
			};
		dao.insertData("user_account", insertParameters, function(rows) {
			if(rows.affectedRows === 1) {
				dao.insertData("user_profile", {
					"contact"	:	phone,
					"user"		:	rows.insertId
				}, function(rows) {
					if(rows.affectedRows === 1) {
						success_messages.push("User " + firstname + " created successfully !");
						res.send({
							"status_code"	:	status_code,
							"messages"		:	success_messages
						});
					} else {
						error_messages.push("Internal error. Please try again..!!");
						res.send({
							"status_code"	:	status_code,
							"messages"		:	error_messages
						});
					}
				});
			} else {
				error_messages.push("Internal error. Please try again..!!");
				res.send({
					"status_code"	:	status_code,
					"messages"		:	error_messages
				});
			}
		});
	} else {
		res.send({
			"status_code"	:	status_code,
			"messages"		:	error_messages
		});
	}
	
});

router.post('/publishSale', function(req, res, next) {
	var title = req.body.advertise_title;
	var item = req.body.advertise_item;
	var condition = req.body.advertise_condition;
	var is_bid = req.body.advertise_is_bid;
	var price = req.body.advertise_price;
	var quantity = req.body.advertise_quantity;
	var desc = req.body.advertise_desc;
	dao.insertData("sale_details", {
		"seller"	:	req.session.loggedInUser.user_id,
		"item"		:	item,
		"condition"	:	condition.condition_id,
		"sale_price":	price,
		"title"		:	title,
		"desc"		:	desc,
		"is_bid"	:	(is_bid ? 1 : 0),
		"sale_qty"	:	quantity,
		"active"	:	1
	}, function(rows) {
		if(rows.affectedRows === 1) {
//			var today = new Date();
//			var j = schedule.scheduleJob(today.addDays(4), );
			setTimeout(function() {
				if(is_bid) {
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
				}
			}, 345600000);
//			}, 120000);
			res.send({
				"status_code"	:	"200"
			});
		} else {
			res.send({
				"status_code"	:	"500"
			});
		}
	});
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
		req.session.destroy(function(err) {
			if(err) {
				res.send({
					"status_code"	:	500
				});
			} else {
				res.send({
					"status_code"	:	200
				});
			}
		});
	}
});

router.post('/signin', function(req, res, next) {
	console.log();
	var passwordpassword = req.body.passwordpassword;
	var username = sjcl.decrypt(req.body.passwordpassword, req.body.userID);
	var password = sjcl.decrypt(req.body.passwordpassword, req.body.password);
	dao.executeQuery('SELECT user_id FROM user_account WHERE user_name = ? OR email = ?', [username, username], function(id_details) {
		dao.fetchData("*", "user_account", {
			"user_id"	:	id_details[0].user_id
		}, function(user_details) {
			if(user_details[0].secret === password) {
				req.session.loggedInUser = user_details[0];
				dao.updateData("user_account", {
					"last_login"	:	require('fecha').format(Date.now(),'YYYY-MM-DD HH:mm:ss')
				}, {
					"user_id"		:	id_details[0].user_id
				}, function(update_status) {
					if(update_status.affectedRows === 1) {
						res.send({
							"valid"	:	true
						});
					}
				});
			} else {
				res.send({
					"valid"	:	false
				});
			}
		});
	});
});

module.exports = router;
