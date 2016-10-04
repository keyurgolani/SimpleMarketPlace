var eBay = angular.module('eBay', []);

eBay.controller('homepage', function($scope, $http, $window) {
	$http({
		method	:	"POST",
		url		:	"/loggedInUser"
	}).success(function(data) {
		if(!angular.equals({},data.userBO)) {
			$scope.user_fname = data.userBO.f_name;
			$scope.user_lname = data.userBO.l_name;
			$scope.user_name = data.userBO.user_name;
		} else {
			
		}
	}).error(function(error) {
		// TODO: Handle Error
	});
	
	$scope.registerClicked = function() {
		$window.location.href = "/account?view=register";
	};
	
	$scope.signinClicked = function() {
		$window.location.href = "/account?view=signin";
	};
	
	$scope.homepageClicked = function() {
		$window.location.href = "/";
	};
	
	$scope.search = function() {
		var searchString = $scope.searchString;
	};
	
	$scope.userNameClicked = function() {
		// TODO: Implement the logic.
	}
});