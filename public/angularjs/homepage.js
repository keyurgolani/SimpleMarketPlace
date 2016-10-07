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

	if ($location.search().signout === 'true') {
		$scope.signout_success = true;
	}

	$scope.notifications = 100;
	$scope.cartItemCount = 10;

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

	$scope.search = function() {
		var searchString = $scope.searchString;
		$http({
			method : "POST",
			url : "/searchSales",
			data : {
				"searchString" : searchString
			}
		}).success(function(data) {
			$scope.sales = data.saleDetails;
			$scope.suggestions = [];
			$location.hash('products-grid');
			$anchorScroll();
		}).error(function(error) {
			// TODO: Handle Error
		});
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

	$http({
		method : "POST",
		url : "/fetchSuggestions"
	}).success(function(data) {
		$scope.suggestions = data.suggestionDetails;
	}).error(function(error) {
		// TODO: Handle Error
	});

	$http({
		method : "POST",
		url : "/fetchSales"
	}).success(function(data) {
		$scope.sales = data.saleDetails;
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