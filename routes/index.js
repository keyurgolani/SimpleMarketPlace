var express = require('express');
var router = express.Router();
var dao = require('./dao.js');
var logger = require("../utils/logger");

/* GET home page. */
router.get('/', function(req, res, next) {
	logger.log("info", "Inside home directory");
	res.render('index', { title: 'Express' });
});

router.get('/signup', function(req, res, next) {
	logger.log("info", "Inside signup form");
	var username = req.param('username');
	var email = req.param('email');
	var secret = req.param('secret');
	var firstname = req.param('firstname');
	var lastname = req.param('lastname');
	var phone = req.param('phone');
	var username_validator = new RegExp("^[a-z0-9_-]{3,16}$");
	//Password Validator: /^[a-z0-9_-]{6,18}$/
	var email_validator = new RegExp("^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,24})$");
	var firstname_validator = new RegExp("^[a-zA-Z ,.'-]+$");
	var lastname_validator = new RegExp("^[a-zA-Z ,.'-]+$");
	var phone_validator = new RegExp(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/);
	//Input Mask for Phone Number: https://github.com/RobinHerbots/Inputmask
	//Continued: http://digitalbush.com/projects/masked-input-plugin/
	//Continued: http://filamentgroup.github.io/politespace/demo/demo.html
	
	var error_messages = [];
	var status_code = 200;
	
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
			// Process Insert Status
		});
	} else {
		res.send({
			"status_code"	:	status_code,
			"messages"		:	error_messages
		});
	}
	
});

router.get('/login', function(req, res, next) {
	logger.log("info", "Inside login form");
	dao.fetchData("*", "user_account", {
		"user_id"	:	1
	}, function(rows) {
		// Process Fetched Data
	});
});

module.exports = router;
