var eBay = angular.module('eBay', ['ngSanitize', 'angular-notification-icons', 'ngAnimate', 'focus-if' ]);

//	TODO: Prevent showing anything until the whole DOM is loaded.

eBay.config(['$locationProvider', function($locationProvider){
    $locationProvider.html5Mode({
    	  enabled: true,
    	  requireBase: false
    });
}]);

eBay.controller('viewItem', function($scope, $http, $location, $window) {
	
	$scope.cart_qty = 0;
	
	$scope.fetchNotificationsCount = function() {
		$http({
			method : "POST",
			url : "/fetchNotificationsCount"
		}).success(function(data) {
			$scope.notifications = data.notification_count;
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchCartCount = function() {
		$http({
			method : "POST",
			url : "/fetchCartCount"
		}).success(function(data) {
			$scope.cartItemCount = data.cart_qty;
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	
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
		if($scope.is_bid) {
			$http({
				method	:	"POST",
				url		:	"/fetchBidDetails",
				data	:	{
					"itemid"	:	$scope.item_id
				}
			}).success(function(data) {
				$scope.bid_details = data.results;
				$scope.number_of_bids = data.results.length;
			}).error(function(err) {
				
			});
		}
	}).error(function(err) {
		
	});
	
	$scope.search = function() {
		$window.location.href = "/?query=" + $scope.searchString;
	};
	
	$scope.buyAndCheckout = function() {
		
	};
	
	$scope.registerClicked = function() {
		$window.location.href = "/account?view=register";
	};

	$scope.signinClicked = function() {
		$window.location.href = "/account?view=signin";
	};
	
	$scope.sellAnItem = function() {
		$window.location.href = "/sell";
	};
	
	$scope.showUser = function(eBay_handle) {
		$window.location.href = "/"+eBay_handle;
	};
	
	$scope.addToCart  = function() {
		$http({
			method	:	"POST",
			url		:	"/addToCart",
			data	:	{
				"itemid"	:	$scope.item_id,
				"qty"		:	$scope.cart_qty
			}
		}).success(function(data) {
			if(data.status_code === 200) {
				$scope.fetchCartCount();
				$scope.message = "Congratulations! " + $scope.item_title + " Added to your Cart!";
				$scope.success = true;
			} else if(data.status_code === 500) {
				$scope.message = "Internal error! Please try again.";
				$scope.success = true;
			} else if(data.status_code === 301) {
				$window.location.href = "/account?view=signin&redir=viewItem-itemid-" + $scope.item_id;
			}
		}).error(function(err) {
			
		});
	};
	
	$http({
		method	:	"POST",
		url		:	"/fetchTransactions",
		data	:	{
			"itemid"	:	$location.search().itemid
		}
	}).success(function(data) {
		$scope.total_sold = data.total_sold === null ? 0 : data.total_sold;
	}).error(function(err) {
		
	});
	
	$scope.homepageClicked = function() {
		$window.location.href = "/";
	};
	
	$scope.userProfile = function() {
		$window.location.href = "/"+$scope.user_name;
	};
	
	$scope.signout = function() {
		$http({
			method : "POST",
			url : "/signoutUser"
		}).success(function(data) {
			$window.location.href = "/?signout=true";
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchCartCount();
	$scope.fetchNotificationsCount();
	
	$http({
		method : "POST",
		url : "/loggedInUser"
	}).success(function(data) {
		if (!angular.equals({}, data.userBO)) {
			$scope.user_fname = data.userBO.f_name;
			$scope.user_lname = data.userBO.l_name;
			$scope.user_name = data.userBO.user_name;
		} else {

		}
	}).error(function(error) {
		// TODO: Handle Error
	});
	
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