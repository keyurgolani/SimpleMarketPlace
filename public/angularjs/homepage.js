var eBay = angular.module('eBay', []);

eBay.controller('homepage', function($scope, $http, $window) {
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
});