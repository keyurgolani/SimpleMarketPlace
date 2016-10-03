var express = require('express');
var router = express.Router();
var dao = require('../utils/dao');
var logger = require("../utils/logger");

var error_messages = [];
var status_code = 200;

/* GET home page. */
router.get('/', function(req, res, next) {
	logger.log("info", "Inside home directory");
	res.render('index', {  });
});

router.get('/account', function(req, res, next) {
	res.render('account', {  });
});

router.post('/register', function(req, res, next) {
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
			// TODO: Process Insert Status
		});
	} else {
		res.send({
			"status_code"	:	status_code,
			"messages"		:	error_messages
		});
	}
	
});

router.get('/forgotPassword', function(req, res, next) {
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
	dao.fetchData("user_id as result", "user_account", {
		"user_name"	:	username
	}, function(rows) {
		dao.fetchData("secret as result", "user_account", {
			"user_id"	:	rows[0].result
		}, function(rows) {
			if(rows[0].result === password) {
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
