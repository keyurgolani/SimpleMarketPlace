var eBay = angular.module('eBay', ["angucomplete-alt"]);

eBay.controller('sell', function($scope, $http) {
	
	$http.get("https://raw.githubusercontent.com/keyurgolani/JSON-Airports/master/airports.json").then(function(response) {
		$scope.items = response.data;
	});
	
	$scope.searchItems = function(str) {
		var matches = [];
		$scope.items.forEach(function(item) {
			if(item.name !== null && item.name !== undefined) {
				if ((item.name.toLowerCase().indexOf(str.toString().toLowerCase()) >= 0) ||
				        (item.iata.toLowerCase().indexOf(str.toString().toLowerCase()) >= 0)) {
						matches.push(item);
					}
			}
		});
		return matches;
	};
	
});