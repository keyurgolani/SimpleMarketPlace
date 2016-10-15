
var dao = require('../utils/dao');
var bcrypt = require("bcrypt");

module.exports.accounts = function(res) {
	res.render('account', {});
};

module.exports.signin = function(username, password, req, res) {
	var salt = bcrypt.genSaltSync(10);
	var passwordToSave = bcrypt.hashSync(password, salt);
	dao.executeQuery("SELECT user_id, secret, salt FROM user_account WHERE user_name = ? OR email = ?", [username, username], function(secret_elements) {
		if(bcrypt.hashSync(password, secret_elements[0].salt) === secret_elements[0].secret) {
			dao.fetchData("*", "user_account", {
				"user_id"	:	secret_elements[0].user_id
			}, function(user_details) {
				req.session.loggedInUser = user_details[0];
				dao.updateData("user_account", {
					"last_login"	:	require('fecha').format(Date.now(),'YYYY-MM-DD HH:mm:ss')
				}, {
					"user_id"		:	secret_elements[0].user_id
				}, function(update_status) {
					if(update_status.affectedRows === 1) {
						res.send({
							"valid"	:	true
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
	// TODO: Password Validator for Angular: /^[a-z0-9_-]{6,18}$/ -- Done
	// TODO: Input Mask for Phone Number: https://github.com/RobinHerbots/Inputmask -- Done
	// TODO: Continued: http://digitalbush.com/projects/masked-input-plugin/ -- Done
	// TODO: Continued: http://filamentgroup.github.io/politespace/demo/demo.html -- Done
	var status_code = 200;
	var error_messages = [];
	var success_messages = [];
	var username_validator = new RegExp("^[a-z0-9_-]{3,16}$");
	var email_validator = new RegExp("^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,24})$");
	var firstname_validator = new RegExp("^[a-zA-Z ,.'-]+$");
	var lastname_validator = new RegExp("^[a-zA-Z ,.'-]+$");
	var phone_validator = new RegExp(/^(\d{11,12})$/);
	
	if(username.match(username_validator) === null) {
		error_messages.push("'" + username + "' is not a valid username.");
		status_code = 400;
	}
	
	if(email.match(email_validator) === null) {
		error_messages.push("'" + email + "' is not a valid email.");
		status_code = 400;
	}
	
	if(firstname.match(firstname_validator) === null) {
		error_messages.push("'" + firstname + "' is not a valid name.");
		status_code = 400;
	}
	
	if(lastname.match(lastname_validator) === null) {
		error_messages.push("'" + lastname + "' is not a valid name.");
		status_code = 400;
	}
	
	if(phone.match(phone_validator) === null) {
		error_messages.push("'" + phone + "' is not a valid phone.");
		status_code = 400;
	}
	if(status_code === 200) {
		var salt = bcrypt.genSaltSync(10);
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
};

module.exports.checkEmailAvailability = function(email, res) {
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