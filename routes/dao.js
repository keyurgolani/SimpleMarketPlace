var mysql = require("mysql");
var logger = require("../utils/logger");

var pool = mysql.createPool({
	connectionLimit :	100,
	host			:	"localhost",
	user			:	"root",
	password		:	"admin",
	database		:	"simple_market_place"
});

module.exports = {
		fetchData: function(selectFields, tableName, queryParameters, processResult) {
			pool.getConnection(function(err, connection) {
				if(err) {
					// Send Error
				}
				var queryString = "SELECT " + selectFields + " FROM " + tableName + " WHERE ?";
				var query = connection.query(queryString, queryParameters, function(error, rows) {
					if(error) {
						throw error;
					} else {
						processResult(rows);
					}
				});
				
				logger.log("debug", "Fetch Executed: " + query.sql);
				
			});
		},

		insertData: function(tableName, insertParameters, processInsertStatus) {
			pool.getConnection(function(err, connection) {
				if(err) {
					// Send Error
				}
				var queryString = "INSERT INTO " + tableName + " SET ?";
				var query = connection.query(queryString, insertParameters, function(error, rows) {
					if(error) {
						throw error;
					} else {
						processInsertStatus(rows);
					}
				});
				
				logger.log("debug", "Insert Executed: " + query.sql);
				
			});
		}

};