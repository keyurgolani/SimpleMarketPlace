//Connection Pooling with Mongo: https://groups.google.com/forum/#!msg/node-mongodb-native/mSGnnuG8C1o/Hiaqvdu1bWoJ

var mongodb = require('mongodb');
var logger = require("../utils/logger");
var MongoClient = mongodb.MongoClient;
var mongoUrl = 'mongodb://127.0.0.1:27017/eBay';
var db;

module.exports = {
	connect: function(callback) {
		logger.logEntry("mongoDao", "connect");
		MongoClient.connect(mongoUrl, function(err, database) {
			if(err) {
				throw err;
			}
			db = database;
			callback();
		});
	},
	fetch: function(collection, queryObject, callback) {
		logger.logEntry("mongoDao", "fetch");
		db.collection(collection).find(queryObject, function(err, cursor) {
			if(err) {
				throw err;
			}
			cursor.toArray(function(err, resultDoc) {
				if(err) {
					throw err;
				}
				callback(resultDoc);
			});
		});
	},
	fetchOne: function(collection, queryObject, callback) {
		logger.logEntry("mongoDao", "fetchOne");
		db.collection(collection).findOne(queryObject, function(err, resultDoc) {
			if(err) {
				throw err;
			}
			callback(resultDoc);
		});
	},
	insert: function(collection, insertObject, callback) {
		logger.logEntry("mongoDao", "insert");
		db.collection(collection).insert(insertObject, {w:1}, function(err, resultDoc) {
			if(err) {
				throw err;
			}
			callback(resultDoc);
		});
	},
	update: function(collection, queryObject, updateObject, callback) {
		logger.logEntry("mongoDao", "update");
		db.collection(collection).update(queryObject, updateObject, {w:1}, function(err, resultDoc) {
			if(err) {
				throw err;
			}
			callback(resultDoc);
		});
	},
	remove: function(collection, queryObject, callback) {
		logger.logEntry("mongoDao", "remove");
		db.collection(collection).remove(queryObject, {w:1}, function(err, resultDoc) {
			if(err) {
				throw err;
			}
			callback(resultDoc);
		});
	}
};