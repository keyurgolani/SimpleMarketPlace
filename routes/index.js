var express = require('express');
var router = express.Router();
var dao = require('../utils/dao');
var logger = require("../utils/logger");

/* GET home page. */
router.get('/', function(req, res, next) {
	logger.log("info", "Inside home directory");
	res.render('index', {  });
});

router.get('/sell', function(req, res, next) {
	logger.log("info", "Inside home directory");
	res.render('sell', {  });
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
	logger.log("info", "Inside signup form");
	var username = req.param('username');
	var email = req.param('email');
	var secret = req.param('password');
	var firstname = req.param('fname');
	var lastname = req.param('lname');
	var phone = req.param('contact');
	var username_validator = new RegExp("^[a-z0-9_-]{3,16}$");
	// TODO: Password Validator for Angular: /^[a-z0-9_-]{6,18}$/
	var email_validator = new RegExp("^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,24})$");
	var firstname_validator = new RegExp("^[a-zA-Z ,.'-]+$");
	var lastname_validator = new RegExp("^[a-zA-Z ,.'-]+$");
	var phone_validator = new RegExp(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/);
	// TODO: Input Mask for Phone Number: https://github.com/RobinHerbots/Inputmask
	// TODO: Continued: http://digitalbush.com/projects/masked-input-plugin/
	// TODO: Continued: http://filamentgroup.github.io/politespace/demo/demo.html
	
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
		"sale_qty"	:	quantity
	}, function(rows) {
		if(rows.affectedRows === 1) {
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

router.post('/signin', function(req, res, next) {
	var username = req.body.userID;
	var password = req.body.password;
	dao.fetchData("user_id", "user_account", {
		"user_name"	:	username
	}, function(rows) {
		dao.fetchData("*", "user_account", {
			"user_id"	:	rows[0].user_id
		}, function(rows) {
			if(rows[0].secret === password) {
				req.session.loggedInUser = rows[0];
				res.send({
					"valid"	:	true
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
