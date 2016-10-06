var eBay = angular.module('eBay', ['ngAnimate']);

eBay.controller('sell', function($scope, $http, $window) {
	
	$scope.message = "";
	
	$http({
		method	:	"POST",
		url		:	"/fetchConditions"
	}).success(function(data) {
		$scope.conditions = data.result;
	}).error(function(error) {
		
	});
	
	$http({
		method	:	"POST",
		url		:	"/fetchItems"
	}).success(function(data) {
		$scope.items = data.result;
	}).error(function(error) {
		
	});
	
	$scope.publish = function() {
		$scope.message = "";
		$http({
			method	:	"POST",
			url		:	"/publishSale",
			data	:	{
				"advertise_title"		:	$scope.adv_title,
				"advertise_item"		:	$scope.adv_item.item_id,
				"advertise_condition"	:	$scope.item_condition,
				"advertise_is_bid"		:	$scope.is_bid,
				"advertise_price"		:	$scope.price,
				"advertise_quantity"	:	$scope.adv_qty,
				"advertise_desc"		:	$scope.adv_desc
			}
		}).success(function(data) {
			if(data.status_code === "200") {
				$window.location.href = "/sell";
			} else {
				$scope.message = "Internal Error. Please try again!";
				$scope.showMore = false;
			}
		}).error(function(error) {
			
		});
	};
	
	$scope.sell = function() {
		$scope.showMore = true;
	};
	
	$scope.homepage = function() {
		if($scope.showMore) {
			$scope.showMore = false;
		} else {
			$window.location.href = "/";
		}
	};
	
	$scope.straightHomepage = function() {
		$window.location.href = "/";
	};
	
});