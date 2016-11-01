var eBay = angular.module('eBay', [ 'angular-notification-icons', 'ngAnimate', 'focus-if' ]);

// Good example to implement no-enter functionality: http://stackoverflow.com/questions/15417125/submit-form-on-pressing-enter-with-angularjs
// Directive for noenter functionality: http://stackoverflow.com/questions/17470790/how-to-use-a-keypress-event-in-angularjs

eBay.config([ '$locationProvider', function($locationProvider) {
	$locationProvider.html5Mode({
		enabled : true,
		requireBase : false
	});
} ]);

eBay.controller('homepage', function($scope, $http, $window, $location, $anchorScroll) {

	// Good article on angular page load: https://weblog.west-wind.com/posts/2014/jun/02/angularjs-ngcloak-problems-on-large-pages
	$scope.messages = [];
	$scope.items_loaded = false;
	$scope.show_notifications = false;
	
	if ($location.search().signout === 'true') {
		$scope.signout_success = true;
	}
	
	$scope.hideNotifications = function() {
		$scope.show_notifications = false;
	};
	
	$scope.sellAnItem = function() {
		$window.location.href = "/sell";
	};
	
	$scope.registerClicked = function() {
		$window.location.href = "/account?view=register";
	};
	
	$scope.signinClicked = function() {
		$window.location.href = "/account?view=signin";
	};
	
	$scope.homepageClicked = function() {
		$window.location.href = "/";
	};
	
	$scope.hideSignOutMessage = function() {
		$scope.signout_success = false;
		$location.url("/");
	};
	
	$scope.hideLastLogin = function() {
		$scope.last_login = "";
	};
	
	$scope.shop = function(item_id) {
		$window.location.href = "/viewItem?itemid=" + item_id;
	};
	
	$scope.userProfile = function() {
		$window.location.href = "/"+$scope.loggedInUser.username;
	};
	
	$scope.gotoCart = function() {
		$window.location.href = "/cart";
	};
	
	$scope.fetchNotifications = function() {
		$http({
			method : "POST",
			url : "/fetchNotifications"
		}).success(function(data) {
			$scope.notifications = data.notifications;
			$scope.notificationCount = data.notifications.length;
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchCart = function() {
		$http({
			method : "POST",
			url : "/fetchCart"
		}).success(function(data) {
			$scope.cart_items = data.cart_items;
			$scope.cartItemCount = data.cart_items.length;
			$scope.cart_total = 0;
			for(var i = 0; i < $scope.cart_items.length; i++) {
				$scope.cart_total = $scope.cart_total + Number($scope.cart_items[i].sale_price) * Number($scope.cart_items[i].cart_qty);
			}
		}).error(function(error) {
			// TODO: Handle Error
		});
	};

	$scope.search = function() {
		$scope.messages = [];
		if($scope.searchString === undefined || $scope.searchString.trim() === "") {
			$scope.messages.push("Enter item title or seller name to search!");
			$scope.fetchSales();
			$scope.fetchSuggestions();
		} else {
			if($scope.searchString.length > 100) {
				$scope.messages.push("Please enter a shorter search string");
				$scope.fetchSales();
				$scope.fetchSuggestions();
			} else {
				var searchString = $scope.searchString;
				$scope.items_loaded = false;
				$http({
					method : "POST",
					url : "/searchSales",
					data : {
						"searchString" : searchString
					}
				}).success(function(data) {
					$scope.sales = data.saleDetails;
					$scope.suggestions = [];
					$scope.items_loaded = true;
				}).error(function(error) {
					// TODO: Handle Error
				});
			}
		}
	};

	$scope.signout = function() {
		$http({
			method : "POST",
			url : "/signoutUser"
		}).success(function(data) {
			$window.location.href = "/?signout=true";
		}).error(function(error) {
			$window.location.href = "/";
		});
	};

	$scope.fetchLoggedInUser = function() {
		$http({
			method : "POST",
			url : "/loggedInUser"
		}).success(function(data) {
			$scope.loggedInUser = data.loggedInUser;
			$scope.loggedInUser.suggestions.reverse();
			$scope.loggedInUser.suggestions.splice(4, $scope.loggedInUser.suggestions.length - 4)
		}).error(function(error) {
			// TODO: Handle Error
		});
	};

	$scope.fetchSales = function() {
		$http({
			method : "POST",
			url : "/fetchSales"
		}).success(function(data) {
			$scope.sales = data.saleDetails;
			$scope.items_loaded = true;
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchLoggedInUser();
	$scope.fetchSales();
	$scope.fetchCart();
	$scope.fetchNotifications();
	
	if($location.search().last_login) {
		$scope.last_login = $location.search().last_login;
		$location.url("/");
	}
	
	if($location.search().query) {
		$scope.searchString = $location.search().query;
		$scope.search();
	}

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