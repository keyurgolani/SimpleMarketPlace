var eBay = angular.module('eBay', ['ngSanitize', 'angular-notification-icons', 'ngAnimate', 'focus-if' ]);

eBay.config([ '$locationProvider', function($locationProvider) {
	$locationProvider.html5Mode({
		enabled : true,
		requireBase : false
	});
} ]);

eBay.controller('userProfile', function($scope, $http, $location, $window) {
	
	$scope.updateContact = function() {
		$http({
			method	:	"POST",
			url 	:	"/updateContact",
			data	:	{
				"contat"	:	$scope.contact,
				"user"		:	$scope.user_id
			}
		}).success(function(data) {
			$scope.contact = data.contact;
			$scope.edit_contact = false;
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.updateDOB = function() {
		var dob = new Date($scope.dob);
		$http({
			method	:	"POST",
			url 	:	"/updateDOB",
			data	:	{
				"dob"		:	dob.getFullYear() + "-" + (Number(dob.getMonth()) + 1) + "-" + dob.getDate(),
				"user"		:	$scope.user_id
			}
		}).success(function(data) {
			$scope.dob = new Date(data.dob);
			$scope.edit_dob = false;
		}).error(function(error) {
			// TODO: Handle Error
		});
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
	
	$scope.search = function() {
		$window.location.href = "/?query=" + $scope.searchString;
	};
	
	$scope.homepageClicked = function() {
		$window.location.href = "/";
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
	
	$scope.userProfile = function() {
		$window.location.href = "/"+$scope.user_name;
	};
	
	$scope.fetchCartCount();
	$scope.fetchNotifications();
	
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
		method	:	"POST",
		url 	:	"/fetchUserProfile",
		data	:	{
			"username"	:	$location.path().substring(1)
		}	
	}).success(function(data) {
		$scope.user_id = data.user_id;
		$scope.fname = data.fname;
		$scope.lname = data.lname;
		$scope.profile_name = data.user_name;
		$scope.sold_count = data.sold_count;
		$scope.bought_count = data.bought_count;
		$scope.sale_count = data.sale_count;
		$scope.contact = data.contact;
		$scope.dob = new Date(data.dob);
		$window.document.title = $scope.fname + " " + $scope.lname + " | eBay";
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