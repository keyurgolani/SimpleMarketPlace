
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

describe('eBay Login Tests', function() {
	it('Valid User and Password Test', function(done) {
		request({
			url : "http://127.0.0.1:3000/signin",
			method : "POST",
			json : true,
			body : {
				"userID" : sjcl.encrypt(passwordpassword, "jondoe"),
				"password" : sjcl.encrypt(passwordpassword, "password123"),
				"passwordpassword" : passwordpassword
			}
		}, function(err, res, body) {
			expect(body.valid).to.equal(true);
			done();
		});
	});
	
	it('Invalid User and Password Test', function(done) {
		request({
			url : "http://127.0.0.1:3000/signin",
			method : "POST",
			json : true,
			body : {
				"userID" : sjcl.encrypt(passwordpassword, "jondoe"),
				"password" : sjcl.encrypt(passwordpassword, "something123"),
				"passwordpassword" : passwordpassword
			}
		}, function(err, res, body) {
			expect(body.valid).to.equal(false);
			done();
		});
	});
	
	it('Contact Update Test', function(done) {
		request({
			url : "http://127.0.0.1:3000/updateContact",
			method : "POST",
			json : true,
			body : {
				"user" : 1,
				"contact" : "16692386056"
			}
		}, function(err, res, body) {
			expect(body.contact).to.equal(16692386056);
			done();
		});
	});
});