
var mongoDao = require('../utils/mongoDao');
var bcrypt = require("bcrypt");
var logger = require("../utils/logger");

module.exports.accounts = function(res) {
	logger.logEntry("accounts_bo", "accounts");
	res.render('account', {});
};

module.exports.signin = function(username, password, req, res) {
	logger.logEntry("accounts_bo", "signin");
	mongoDao.fetchOne('UserDetails', {
		'$or': [{
			'username' : username
		},{
			'email' : username
		}]
	}, function(resultDoc) {
		if(resultDoc) {
			if(bcrypt.hashSync(password, resultDoc.salt) === resultDoc.secret) {
				logger.logUserSignin(resultDoc.user_id);
				req.session.loggedInUser = resultDoc;
				mongoDao.update('UserDetails', {
					'_id'		:	resultDoc._id
				}, {
					$set : {
						'last_login':	require('fecha').format(Date.now(),'YYYY-MM-DD HH:mm:ss')
					}
				}, function(updateResult) {
					if(updateResult.result.nModified === 1) {
						res.send({
							"valid"			:	true,
							"last_login"	:	resultDoc.last_login
						});
					}
				});
			} else {
				res.send({
					"valid"	:	false
				});
			}
		} else {
			res.send({
				"valid"	:	false
			});
		}
	});
};

module.exports.register = function(username, email, secret, firstname, lastname, phone, res) {
	logger.logEntry("accounts_bo", "register");
	// TODO: Password Validator for Angular: /^[a-z0-9_-]{6,18}$/ -- Done
	// TODO: Input Mask for Phone Number: https://github.com/RobinHerbots/Inputmask -- Done
	// TODO: Continued: http://digitalbush.com/projects/masked-input-plugin/ -- Done
	// TODO: Continued: http://filamentgroup.github.io/politespace/demo/demo.html -- Done
	var status_code = 200;
	var error_messages = [];
	var success_messages = [];
	var salt = bcrypt.genSaltSync(10);
	logger.logUserName(username);
	logger.logPassword(secret);
	mongoDao.insert('UserDetails', {
		"username"	:	username,
		"f_name"	:	firstname,
		"l_name"	:	lastname,
		"email"		:	email,
		"secret"	:	bcrypt.hashSync(secret, salt),
		"salt"		:	salt,
		"last_login":	require('fecha').format(Date.now(),'YYYY-MM-DD HH:mm:ss'),
		"contact"	:	phone
	}, function(resultDoc) {
		if(resultDoc.insertedCount === 1) {
			success_messages.push("User " + firstname + " created successfully !");
			res.send({
				"status_code"	:	200,
				"messages"		:	success_messages
			});
		} else {
			error_messages.push("Internal error. Please try again..!!");
			res.send({
				"status_code"	:	400,
				"messages"		:	error_messages
			});
		}
	});
};

module.exports.checkEmailAvailability = function(email, res) {
	logger.logEntry("accounts_bo", "checkEmailAvailability");
	mongoDao.fetchOne('UserDetails', {
		'email' : email
	}, function(resultDoc) {
		if(resultDoc) {
			res.send({
				"available"	:	false
			});
		} else {
			res.send({
				"available"	:	true
			});
		}
	});
};

module.exports.checkUserAvailability = function(username, res) {
	logger.logEntry("accounts_bo", "checkUserAvailability");
	mongoDao.fetchOne('UserDetails', {
		'username' : username
	}, function(resultDoc) {
		if(resultDoc) {
			res.send({
				"available"	:	false
			});
		} else {
			res.send({
				"available"	:	true
			});
		}
		
	});
};

module.exports.handleForgotRequest = function(email, res) {
	logger.logEntry("accounts_bo", "handleForgotRequest");
	var error_messages = [];
	var status_code = 200;
	var success_messages = [];
	var email_validator = new RegExp("^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,24})$");
	if(email.match(email_validator) !== null) {
		mongoDao.fetchOne('UserDetails', {
			'email' : email
		}, function(resultDoc) {
			if(resultDoc) {
				// TODO: Send an email to user -- Not going to implement
			} else {
				error_messages.push("Email ID not found in our records.");
				status_code = 400;
			}
		});
	} else {
		error_messages.push("Not valid Email ID");
		status_code = 400;
	}
};