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
		$window.location.href = "/"+$scope.user_name;
	};
	
	$scope.gotoCart = function() {
		$window.location.href = "/cart";
	};
	
	$scope.fetchNotifications = function() {
		$http({
			method : "POST",
			url : "/fetchNotifications"
		}).then(function(result) {
			$scope.notifications = result.data.notifications;
			$scope.notificationCount = result.data.notifications.length;
		}, function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchCart = function() {
		$http({
			method : "POST",
			url : "/fetchCart"
		}).then(function(result) {
			$scope.cart_items = result.data.cart_items;
			$scope.cartItemCount = result.data.cart_items.length;
			$scope.cart_total = 0;
			for(var i = 0; i < $scope.cart_items.length; i++) {
				$scope.cart_total = $scope.cart_total + Number($scope.cart_items[i].sale_price) * Number($scope.cart_items[i].cart_qty);
			}
		}, function(error) {
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
				}).then(function(result) {
					$scope.sales = result.data.saleDetails;
					$scope.suggestions = [];
					$scope.items_loaded = true;
				}, function(error) {
					// TODO: Handle Error
				});
			}
		}
	};

	$scope.signout = function() {
		$http({
			method : "POST",
			url : "/signoutUser"
		}).then(function(result) {
			$window.location.href = "/?signout=true";
		}, function(error) {
			$window.location.href = "/";
		});
	};

	$scope.fetchLoggedInUser = function() {
		$http({
			method : "POST",
			url : "/loggedInUser"
		}).then(function(result) {
			$scope.user_fname = result.data.userBO.f_name;
			$scope.user_lname = result.data.userBO.l_name;
			$scope.user_name = result.data.userBO.user_name;
			$scope.user_id = result.data.userBO.user_id;
		}, function(error) {
			
		});
	};

	$scope.fetchSuggestions = function() {
		$http({
			method : "POST",
			url : "/fetchSuggestions"
		}).then(function(result) {
			$scope.suggestions = result.data.suggestionDetails;
		}, function(error) {
			// TODO: Handle Error
		});
	};

	$scope.fetchSales = function() {
		$http({
			method : "POST",
			url : "/fetchSales"
		}).then(function(results) {
			$scope.sales = results.data.saleDetails;
			$scope.items_loaded = true;
		}, function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.fetchLoggedInUser();
	$scope.fetchSuggestions();
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