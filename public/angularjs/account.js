var eBay = angular.module('eBay', ['ngRoute']);

//eBay.config([
//    '$routeProvider',
//    function($routeProvider) {
//        $routeProvider.when('/', {
//            templateUrl: '',
//            controller: 'account'
//        });
//    }
//]);

eBay.controller('account', function($scope, $http, $routeParams) {
	$scope.message = "";
	$scope.isSignin = false;
	$scope.isSignup = false;
	$scope.isForgot = true;
	
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

eBay.controller('signinController', function($scope, $http, $window) {
	$scope.signin = function() {
		$http({
			method	:	"POST",
			url		:	"/signin",
			data	:	{
				"userID"	:	$scope.userID,
				"password"	:	$scope.password
			}
		}).success(function(data) {
			if(Boolean(data.valid)) {
				$window.location.href = "/";
			} else {
				$scope.message = "Oops, that's not a match.";
			}
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
});

eBay.controller('registerController', function($scope, $http, $window) {
	$scope.register = function() {
		$http({
			method	:	"POST",
			url		:	"/register",
			data	:	{
				"email"		:	$scope.email,
				"username"	:	$scope.username,
				"password"	:	$scope.password,
				"fname"		:	$scope.fname,
				"lname"		:	$scope.lname,
				"contact"	:	$scope.contact
			}
		}).success(function(data) {
			$window.location.href = "/account";
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
});

eBay.controller('forgotController', function($scope, $http) {
	$scope.forgot = function() {
		
	};
});