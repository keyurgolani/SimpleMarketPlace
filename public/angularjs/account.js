var eBay = angular.module('eBay', ['internationalPhoneNumber']);
// Watching multiple fields with AngularJS: http://stackoverflow.com/questions/17872919/can-i-combine-watching-of-multiple-fields-into-one-watch-with-angularjs
eBay.config(['$locationProvider', function($locationProvider){
    $locationProvider.html5Mode({
    	  enabled: true,
    	  requireBase: false
    });
}]);

eBay.controller('account', function($scope, $http, $location, $window) {
	$scope.message = "";
	$scope.show_more = true;
	
	$scope.changeToSignin = function() {
		$location.url("/account?view=signin");
		$scope.isSignin = true;
		$scope.isSignup = false;
		$scope.isForgot = false;
	};
	
	$scope.changeToRegister = function() {
		$location.url("/account?view=register");
		$scope.isSignin = false;
		$scope.isSignup = true;
		$scope.isForgot = false;
	};
	
	$scope.changeToForgot = function() {
		$location.url("/account?view=forgot");
		$scope.isSignin = false;
		$scope.isSignup = false;
		$scope.isForgot = true;
	};
	
	$scope.homepage = function() {
		$window.location.href = "/";
	};
	
	if($location.search().view === "register") {
		$scope.changeToRegister();
	} else if($location.search().view === "signin") {
		$scope.changeToSignin();
	} else if($location.search().view === "forgot") {
		$scope.changeToForgot();
	} else {
		$scope.changeToSignin();
	}
	
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
				$scope.error_message = "Oops, that's not a match.";
			}
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
});

eBay.controller('registerController', function($scope, $http, $location) {
	$scope.register = function() {
		$scope.$parent.messages = [];
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
			$scope.$parent.status_code = data.status_code;
			if(data.status_code === 200) {
				$location.url("/account?view=signin");
				$scope.$parent.isSignin = true;
				$scope.$parent.isSignup = false;
				$scope.$parent.isForgot = false;
				$scope.$parent.messages = data.messages;
			} else {
				$location.url("/account?view=register");
				$scope.$parent.messages = data.messages;
				$scope.$parent.isSignin = false;
				$scope.$parent.isSignup = true;
				$scope.$parent.isForgot = false;
			}
		}).error(function(error) {
			// TODO: Handle Error
		});
	};
	
	$scope.$watch('email', function() {
		$http({
			method	:	"POST",
			url		:	"/emailIDAvailable",
			data	:	{
				"email"	:	$scope.email
			}
		}).success(function(data) {
			if(Boolean(data.available)) {
				$scope.emailAvailable = true;
			} else {
				$scope.emailAvailable = false;
			}
		}).error(function(error) {
			// TODO: Handle Error
		});
	});
	
	$scope.$watch('username', function() {
		$http({
			method	:	"POST",
			url		:	"/usernameAvailable",
			data	:	{
				"username"	:	$scope.username
			}
		}).success(function(data) {
			if(Boolean(data.available)) {
				$scope.userAvailable = true;
			} else {
				$scope.userAvailable = false;
			}
		}).error(function(error) {
			// TODO: Handle Error
		});
	});
	
	$scope.$watch('password', function() {
		var password_validator = new RegExp(/^[A-Za-z0-9_-]{6,18}$/);
		if($scope.password.match(password_validator) !== null) {
			$scope.validPassword = true;
		} else {
			$scope.validPassword = false;
		}
	});
	
});

eBay.controller('forgotController', function($scope, $http) {
	$scope.forgot = function() {
		
	};
});