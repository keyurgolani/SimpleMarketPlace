var eBay = angular.module('eBay', []);

eBay.controller('account', function($scope, $http) {
	$scope.isSignin = true;
	$scope.isSignup = false;
	$scope.isForgot = false;
	
	$scope.changeToSignin = function() {
		$scope.isSignin = true;
		$scope.isSignup = false;
		$scope.isForgot = false;
	};
	
	$scope.changeToRegister = function() {
		$scope.isSignin = false;
		$scope.isSignup = true;
		$scope.isForgot = false;
	};
	
	$scope.changeToForgot = function() {
		$scope.isSignin = false;
		$scope.isSignup = false;
		$scope.isForgot = true;
	};
});

eBay.controller('signinController', function($scope, $http) {
	$scope.signin = function() {
		
	};
});

eBay.controller('registerController', function($scope, $http) {
	$scope.register = function() {
		
	};
});

eBay.controller('forgotController', function($scope, $http) {
	$scope.forgot = function() {
		
	};
});