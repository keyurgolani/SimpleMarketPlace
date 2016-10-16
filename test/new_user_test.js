
var expect = require("chai").expect;
var request = require("request");
var sjcl = require("sjcl");

var randomString = function(length) {
	var generatedString = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var i = 0; i < length; i++) {
		generatedString += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return generatedString;
};

var passwordpassword = randomString(25);

describe('eBay New User Tests', function() {
	it('Valid Registration Parameters', function(done) {
		request({
			url : "http://127.0.0.1:3000/register",
			method : "POST",
			json : true,
			body : {
				"email"				:	"abc@xyz.com",
				"username"			:	sjcl.encrypt(passwordpassword, "keyurrgolani"),
				"password"			:	sjcl.encrypt(passwordpassword, "password123"),
				"fname"				:	"Jon",
				"lname"				:	"Doe",
				"contact"			:	"6698881212",
				"passwordpassword"	:	passwordpassword
			}
		}, function(err, res, body) {
			expect(body.status_code).to.equal(200);
			done();
		});
	});

});