var mysql = require("mysql");
var logger = require("../utils/logger");

// Transactions will be useful for Cart Checkout Query Execution: https://github.com/mysqljs/mysql#transactions

function getConnection() {
	var connection = mysql.createConnection({
		host : 'localhost',
		user : 'root',
		password : 'admin',
		database : 'simple_market_place',
		port : 3306
	});
	return connection;
}

function Pool(connection_no) {
	this.pool = [];
	this.isAvailable = [];
	for (var i = 0; i < connection_no; i++) {
		this.pool.push(getConnection());
	}
	for (var j = 0; j < connection_no; j++) {
		this.isAvailable.push(true);
	}
}

Pool.prototype.get = function(useConnection) {
	var cli;
	var connectionNumber;
	for (var i = 0; i < this.pool.length; i++) {
		if (this.isAvailable[i]) {
			cli = this.pool[i];
			this.isAvailable[i] = false;
			connectionNumber = i;
			break;
		}
		if (i === this.pool.length - 1) {
			i = 0;
		}
	}
	useConnection(connectionNumber, cli);
};

Pool.prototype.release = function(connectionNumber, connection) {
	this.isAvailable[connectionNumber] = true;
};

function initializeConnectionPool() {
	var p = new Pool(10);
	return p;
}

var connectionPool = initializeConnectionPool();

module.exports = {
	fetchData	:	function(selectFields, tableName, queryParameters, processResult) {
		connectionPool.get(function(connectionNumber, connection) {
			var queryString = "SELECT " + selectFields + " FROM " + tableName + " WHERE ?";
			var query = connection.query(queryString, queryParameters, function(error, rows) {
				connectionPool.release(connectionNumber, connection);
				if (error) {
					throw error;
				} else {
					processResult(rows);
				}
			});
			logger.log("debug", "Fetch Executed: " + query.sql);

		});
	},

	insertData	:	function(tableName, insertParameters, processInsertStatus) {
		connectionPool.get(function(connectionNumber, connection) {
			var queryString = "INSERT INTO " + tableName + " SET ?";
			var query = connection.query(queryString, insertParameters, function(error, rows) {
				connectionPool.release(connectionNumber, connection);
				if (error) {
					throw error;
				} else {
					processInsertStatus(rows);
				}
			});
			logger.log("debug", "Insert Executed: " + query.sql);

		});
	},
	
	updateData	:	function(tableName, insertParameters, queryParameters, processUpdateStatus) {
		connectionPool.get(function(connectionNumber, connection) {
			var queryString = "UPDATE TABLE " + tableName + " SET ? WHERE ?";
			var query = connection.query(queryString, [insertParameters, queryParameters], function(error, rows) {
				connectionPool.release(connectionNumber, connection);
				if (error) {
					throw error;
				} else {
					processUpdateStatus(rows);
				}
			});
			logger.log("debug", "Insert Executed: " + query.sql);

		});
	}
};