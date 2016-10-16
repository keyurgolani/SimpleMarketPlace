
var expect = require("chai").expect;
var request = require("request");
var sjcl = require("sjcl");

describe('eBay Signout Tests', function() {
	it('Signs the user out', function(done) {
		request({
			url : "http://127.0.0.1:3000/signoutUser",
			method : "POST",
			json : true
		}, function(err, res, body) {
			expect(body.status_code).to.equal(200);
			done();
		});
	});
});