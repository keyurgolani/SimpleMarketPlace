var eBay = angular.module('eBay', ['ngSanitize', 'angular-notification-icons', 'ngAnimate', 'focus-if' ]);

eBay.config([ '$locationProvider', function($locationProvider) {
	$locationProvider.html5Mode({
		enabled : true,
		requireBase : false
	});
} ]);

eBay.controller('userProfile', function($scope, $http, $location, $window) {

	$scope.fetchSold = function() {
		$http({
			method	:	"POST",
			url 	:	"/fetchSoldByUser",
			data	:	{
				"user"		:	$scope.user_id
			}
		}).then(function(data) {
			$scope.sold_items = data.data.soldItems;
			$scope.sold_count = $scope.sold_items.length;
		}, function(error) {
			// TODO: Handle Error
		});
	};

	$scope.fetchBought = function() {
		$http({
			method	:	"POST",
			url 	:	"/fetchBoughtByUser",
			data	:	{
				"user"		:	$scope.user_id
			}
		}).then(function(data) {
			$scope.bought_items = data.data.boughtItems;
			$scope.bought_count = $scope.bought_items.length;
		}, function(error) {
			// TODO: Handle Error
		});
	};

	$scope.fetchSale = function() {
		$http({
			method	:	"POST",
			url 	:	"/fetchSaleByUser",
			data	:	{
				"user"		:	$scope.user_id
			}
		}).then(function(data) {
			$scope.sale_items = data.data.saleItems;
			$scope.sale_count = $scope.sale_items.length;
		}, function(error) {
			// TODO: Handle Error
		});
	};

	$scope.updateContact = function() {
		$http({
			method	:	"POST",
			url 	:	"/updateContact",
			data	:	{
				"contact"	:	$scope.contact,
				"user"		:	$scope.user_id
			}
		}).then(function(data) {
			$scope.contact = data.data.contact;
			$scope.edit_contact = false;
		}, function(error) {
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
		}).then(function(data) {
			$scope.dob = new Date(data.data.dob);
			$scope.edit_dob = false;
		}, function(error) {
			// TODO: Handle Error
		});
	};

	$scope.fetchAddresses = function() {
		$http({
			method	:	"POST",
			url 	:	"/fetchAddresses",
			data	:	{
				"user"		:	$scope.user_id
			}
		}).then(function(data) {
			$scope.addresses = data.data.addresses;
		}, function(error) {
			// TODO: Handle Error
		});
	};

	$scope.addAddress = function() {
		$scope.messages = [];
		if($scope.street_address !== undefined && $scope.street_address.trim() !== "" &&
				$scope.city !== undefined && $scope.city.trim() !== "" &&
				$scope.state !== undefined && $scope.state.trim() !== "" &&
				$scope.country !== undefined && $scope.country.trim() !== "" &&
				$scope.zip_code !== undefined && $scope.zip_code.trim() !== "") {
			$http({
				method	:	"POST",
				url 	:	"/addAddress",
				data	:	{
					"st_address"	:	$scope.street_address,
					"apt"			:	$scope.apartment,
					"city"			:	$scope.city,
					"state"			:	$scope.state,
					"country"		:	$scope.country,
					"zip"			:	$scope.zip_code,
					"user_id"		:	$scope.user_id
				}
			}).then(function(data) {
				if(data.data.status_code === 200) {
					$scope.fetchAddresses();
					$scope.add_address = false;
				}
			}, function(error) {
				// TODO: Handle Error
			});
		} else {
			$scope.messages.push("Please add all mendatory values of address!");
		}
	};

	$scope.fetchNotifications = function() {
		$http({
			method : "POST",
			url : "/fetchNotifications"
		}).then(function(data) {
			$scope.notifications = data.data.notifications;
			$scope.notificationCount = data.data.notifications.length;
		}, function(error) {
			// TODO: Handle Error
		});
	};

	$scope.fetchCart = function() {
		$http({
			method : "POST",
			url : "/fetchCart"
		}).then(function(data) {
			$scope.cart_items = data.data.cart_items;
			$scope.cartItemCount = data.data.cart_items.length;
			$scope.cart_total = 0;
			for(var i = 0; i < $scope.cart_items.length; i++) {
				$scope.cart_total = $scope.cart_total + Number($scope.cart_items[i].sale_price) * Number($scope.cart_items[i].cart_qty);
			}
		}, function(error) {
			// Do Nothing
		});
	};

	$scope.updatePrice = function(sale_item) {
		sale_item.edit_price = false;
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

	$scope.gotoCart = function() {
		$window.location.href = "/cart";
	};

	$scope.show_notifications = false;

	$scope.hideNotifications = function() {
		$scope.show_notifications = false;
	};

	$scope.signout = function() {
		$http({
			method : "POST",
			url : "/signoutUser"
		}).then(function(data) {
			$window.location.href = "/?signout=true";
		}, function(error) {
			// TODO: Handle Error
		});
	};

	$scope.fetchUserProfile = function() {
		$http({
			method	:	"POST",
			url 	:	"/fetchUserProfile",
			data	:	{
				"username"	:	$location.path().substring(1)
			}
		}).then(function(data) {
			$scope.user_id = data.data.user_id;
			$scope.fname = data.data.fname;
			$scope.lname = data.data.lname;
			$scope.profile_name = data.data.user_name;
			$scope.contact = data.data.contact;
			$scope.dob = new Date(data.data.dob);
			$window.document.title = $scope.fname + " " + $scope.lname + " | eBay";
			$scope.fetchAddresses();
			$scope.fetchCart();
			$scope.fetchNotifications();
			$scope.fetchSold();
			$scope.fetchBought();
			$scope.fetchSale();
		}, function(error) {
			// TODO: Handle Error
		});
	};

	$scope.fetchUserProfile();

	$http({
		method : "POST",
		url : "/loggedInUser"
	}).then(function(data) {
		if (!angular.equals({}, data.data.userBO)) {
			$scope.user_fname = data.data.userBO.f_name;
			$scope.user_lname = data.data.userBO.l_name;
			$scope.user_name = data.data.userBO.user_name;
			$scope.user_id = data.data.userBO.user_id;
		} else {

		}
	}, function(error) {
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
