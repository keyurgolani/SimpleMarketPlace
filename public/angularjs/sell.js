var eBay = angular.module('eBay', ['ngAnimate', 'focus-if']);

eBay.controller('sell', function($scope, $http, $window) {

	$scope.isLoggedIn = false;
	$scope.messages = [];

	$http({
		method : "POST",
		url : "/loggedInUser"
	}).then(function(data) {
		if (angular.equals({}, data.data.userBO)) {
			$window.location.href = "/account?view=signin";
		} else {
			$scope.isLoggedIn = true;
		}
	}, function(error) {
		$window.location.href = "/";
	});

	$http({
		method	:	"POST",
		url		:	"/fetchConditions"
	}).then(function(data) {
		$scope.conditions = data.data.result;
	}, function(error) {
		$scope.messages.push("Oops, something went wrong behind the scenes, please try again!");
	});

	$http({
		method	:	"POST",
		url		:	"/fetchItems"
	}).then(function(data) {
		$scope.items = data.data.result;
	}, function(error) {
		$scope.messages.push("Oops, something went wrong behind the scenes, please try again!");
	});

	$scope.publish = function() {
		$scope.messages = [];
		if($scope.adv_title !== undefined && $scope.adv_title.trim() !== "" &&
				$scope.price !== undefined && $scope.price.trim() !== "" &&
				$scope.adv_qty !== undefined && $scope.adv_qty.trim() !== "" &&
				$scope.adv_desc !== undefined && $scope.adv_desc.trim() !== "") {
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
			}).then(function(data) {
				if(data.data.status_code === "200") {
						$scope.adv_title = "";
						$scope.adv_item.item_id = "";
						$scope.item_condition = "";
						$scope.is_bid = false;
						$scope.price = "";
						$scope.adv_qty = "";
						$scope.adv_desc = "";
						$scope.showMore = false;
						$scope.messages.push("Sale published successfully!");
					} else {
					$scope.messages.push("Oops, something went wrong behind the scenes, please try again!");
					$scope.showMore = false;
				}
			}, function(error) {
				$scope.messages.push("Oops, something went wrong behind the scenes, please try again!");
			});
		} else {
			$scope.messages.push("Please fill all the sale details to publish it!");
		}
	};

	$scope.sell = function() {
		$scope.messages = [];
		if($scope.adv_title !== undefined && $scope.adv_title.trim() !== "") {
			$scope.showMore = true;
		} else {
			$scope.messages.push("Please add title to start selling!");
		}
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

eBay.directive('ngEnter', function() {
	return function(scope, element, attrs) {
		element.bind("keydown keypress", function(event) {
			if (event.which === 13) {
				scope.$apply(function() {
					scope.$eval(attrs.ngEnter);
				});
				event.preventDefault();
			}
		});
	};
});
