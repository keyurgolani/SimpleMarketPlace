
var dao = require('../utils/dao');
var bcrypt = require("bcrypt");
var logger = require("../utils/logger");
var soap = require("soap");
var option = {
	ignoredNamespaces : true
};
var baseURL = "http://localhost:8080/WebServices/services/"

module.exports.accounts = function(res) {
	logger.logEntry("accounts_bo", "accounts");
	res.render('account', {});
};

module.exports.signin = function(username, password, req, res) {
	logger.logEntry("accounts_bo", "signin");
	url = baseURL + "AccountServices?wsdl";
	soap.createClient(url, option, function(err, client) {
		client.authenticate({
			username : username,
			password : password
		}, function(error, result) {
			if(error) {
				throw error;
			} else {
				if(result.authenticateReturn) {
					client.fetchUser({
						username : username
					}, function(error, fetchResult) {
						if(fetchResult.fetchUserReturn) {
							logger.logUserSignin(fetchResult.fetchUserReturn.user_id);
							req.session.loggedInUser = JSON.parse(fetchResult.fetchUserReturn);
							client.updateLastLogin({
								user_id : JSON.parse(fetchResult.fetchUserReturn).user_id
							}, function(error, updateResult) {
								res.send({
									"valid"			:	true,
									"last_login"	:	JSON.parse(fetchResult.fetchUserReturn).last_login
								});
							});
						}
					});
				} else {
					res.send({
						"valid"	:	false
					});
				}
			}
		});
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
	logger.logUserName(username);
	logger.logPassword(secret);
	url = baseURL + "AccountServices?wsdl";
	soap.createClient(url, option, function(err, client) {
		client.addUser({
			"username"	:	username,
			"firstname"	:	firstname,
			"lastname"	:	lastname,
			"email"		:	email,
			"secret"	:	secret,
			"last_login":	require('fecha').format(Date.now(),'YYYY-MM-DD HH:mm:ss')
		}, function(error, result) {
			if(result) {
				success_messages.push("User " + firstname + " created successfully !");
				res.send({
					"status_code"	:	200,
					"messages"		:	success_messages
				});
			}
		});
	});
};

module.exports.checkEmailAvailability = function(email, res) {
	logger.logEntry("accounts_bo", "checkEmailAvailability");
	dao.executeQuery("SELECT COUNT(email) as count FROM user_account WHERE email like ?", [email], function(result) {
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
};

module.exports.checkUserAvailability = function(username, res) {
	logger.logEntry("accounts_bo", "checkUserAvailability");
	dao.executeQuery("SELECT COUNT(user_name) as count FROM user_account WHERE user_name like ?", [username], function(result) {
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
};

module.exports.handleForgotRequest = function(email, res) {
	logger.logEntry("accounts_bo", "handleForgotRequest");
	var error_messages = [];
	var status_code = 200;
	var success_messages = [];
	var email_validator = new RegExp("^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,24})$");
	if(email.match(email_validator) !== null) {
		dao.fetchData("count(user_id) as matches", "user_account", {
			"email"	:	email
		}, function(rows) {
			if(Number(rows[0].matches) > 0) {
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