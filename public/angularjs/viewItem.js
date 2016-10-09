var eBay = angular.module('eBay', ['ngSanitize']);

eBay.config(['$locationProvider', function($locationProvider){
    $locationProvider.html5Mode({
    	  enabled: true,
    	  requireBase: false
    });
}]);

eBay.controller('viewItem', function($scope, $http, $location, $window) {
	
	$scope.cart_qty = 0;
	
	$http({
		method	:	"POST",
		url		:	"/fetchItemDetails",
		data	:	{
			"itemid"	:	$location.search().itemid
		}
	}).success(function(data) {
		$scope.item_id = data.item_id;
		$scope.item_title = data.item_title;
		$scope.item_description = data.item_description.replace(/\n/g, '<br/>');
		$scope.item_condition = data.item_condition;
		$scope.available_quantity = data.available_quantity;
		$scope.is_bid = Number(data.is_bid) === 1 ? true : false;
		$scope.current_price = data.current_price;
		$scope.item_seller_fname = data.item_seller_fname;
		$scope.item_seller_lname = data.item_seller_lname;
		$scope.item_seller_handle = data.item_seller_handle;
		$scope.item_seller_id = data.item_seller_id;
		$window.document.title = $scope.item_title + " | eBay";
	}).error(function(err) {
		
	});
	
});