
var dao = require('../utils/dao');
var bcrypt = require("bcrypt");
var logger = require("../utils/logger");

module.exports.accounts = function(res) {
	logger.logEntry("accounts_bo", "accounts");
	res.render('account', {});
};

module.exports.signin = function(username, password, req, res) {
	logger.logEntry("accounts_bo", "signin");
	dao.executeQuery("SELECT user_id, secret, salt FROM user_account WHERE user_name = ? OR email = ?", [username, username], function(secret_elements) {
		if(bcrypt.hashSync(password, secret_elements[0].salt) === secret_elements[0].secret) {
			dao.fetchData("*", "user_account", {
				"user_id"	:	secret_elements[0].user_id
			}, function(user_details) {
				logger.logUserSignin(secret_elements[0].user_id);
				req.session.loggedInUser = user_details[0];
				dao.updateData("user_account", {
					"last_login"	:	require('fecha').format(Date.now(),'YYYY-MM-DD HH:mm:ss')
				}, {
					"user_id"		:	secret_elements[0].user_id
				}, function(update_status) {
					if(update_status.affectedRows === 1) {
						res.send({
							"valid"			:	true,
							"last_login"	:	user_details[0].last_login
						});
					}
				});
			});
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
	var insertParameters = {
			"user_name"	:	username,
			"f_name"	:	firstname,
			"l_name"	:	lastname,
			"email"		:	email,
			"secret"	:	bcrypt.hashSync(secret, salt),
			"salt"		:	salt,
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