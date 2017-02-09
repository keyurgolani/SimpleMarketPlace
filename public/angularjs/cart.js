var eBay = angular.module('eBay', [ 'angular-notification-icons', 'ngAnimate', 'focus-if' ]);

eBay.controller('homepage', function($scope, $http, $window, $location, $anchorScroll) {

	$scope.messages = [];
	$scope.success = [];
	$scope.outer_messages = [];

	$scope.fetchLoggedInUser = function() {
		$http({
			method : "POST",
			url : "/loggedInUser"
		}).then(function(data) {
			if (!angular.equals({}, data.data.userBO)) {
				$scope.user_fname = data.data.userBO.f_name;
				$scope.user_lname = data.data.userBO.l_name;
				$scope.user_name = data.data.userBO.user_name;
				$scope.user_id = data.data.userBO.user_id;
				$scope.fetchAddresses();
			} else {

			}
		}, function(error) {
			// TODO: Handle Error
		});
	};

	$scope.fetchLoggedInUser();

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

	$scope.checkout = function() {
		$http({
			method	:	"POST",
			url 	:	"/checkCartQtyAvailable",
		}).then(function(data) {
			if(Boolean(data.data.available)) {
				$scope.messages = [];
				var visaElectronCardRE = new RegExp("^(?:(?:2131|1800|35\d{3})\d{11})$");
				var americanExpressCardRE = new RegExp("^(?:3[47][0-9]{13})$");
				var dinersCardRE = new RegExp("^(?:3(?:0[0-5]|[68][0-9])[0-9]{11})$");
				var visaCardRE = new RegExp("^(?:4[0-9]{12}(?:[0-9]{3})?)$");
			    var masterCardRE = new RegExp("^(?:5[1-5][0-9]{14})$");
			    var discoverCardRE = new RegExp("^(?:6(?:011|5[0-9][0-9])[0-9]{12})$");
			    var cvvRegex = new RegExp("^[0-9]{3,4}$");
			    var expiryDateRegex = new RegExp("^(0[1-9]|1[0-2])\/?(20)?([0-9]{2})$");
			    var isValidCard = false;
			    var isValidExp = false;
			    var isValidCVV = false;
			    var isNotExpired = false;
			    if($scope.cardNumber !== undefined && $scope.expiryDate !== undefined && $scope.cvvNumber !== undefined && $scope.card_holder_fname !== undefined && $scope.card_holder_lname !== undefined) {
			    	var dateMatch = $scope.expiryDate.match(expiryDateRegex);
				    if($scope.cardNumber.match(visaElectronCardRE) === null && $scope.cardNumber.match(americanExpressCardRE) === null && $scope.cardNumber.match(dinersCardRE) === null &&
				    		$scope.cardNumber.match(visaCardRE) === null && $scope.cardNumber.match(masterCardRE) === null && $scope.cardNumber.match(discoverCardRE) === null) {
				    	$scope.messages.push("Not a valid Card Number!");
				    }
				    if(dateMatch === null) {
				    	$scope.messages.push("Not a valid Date Format!");
				    } else {
				    	var today = new Date();
				    	var expiryMonth = dateMatch[1];
				    	var expiryYear = dateMatch[3];
				    	if(today.getFullYear() > Number("20" + expiryYear)) {
				    		$scope.messages.push("Card is already expired!");
				    	} else if(today.getFullYear() === Number("20" + expiryYear)) {
				    		if(today.getMonth() + 1 > Number(expiryMonth)) {
				    			$scope.messages.push("Card is already expired!");
				    		}
				    	}
				    }
				    if($scope.cvvNumber.match(cvvRegex) === null) {
				    	$scope.messages.push("Not a valid CVV!");
				    }
					if($scope.messages.length === 0) {
						$http({
							method : "POST",
							url : "/checkout"
						}).then(function(data) {
							$scope.fetchCart();
							$scope.show_checkout = false;
							$scope.success.push("Congratulations! Checkout successful! Please see your account to see transaction details");
						}, function(error) {
							// TODO: Handle Error
						});
					}
			    } else {
			    	$scope.messages.push("Please fill all the mendatory fields");
			    }
			} else {
				$scope.messages.push("Quantities you want aren't available with the seller! Please check available quantities on product page!");
			}
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
			// TODO: Handle Error
		});
	};

	$scope.remove = function(item_id) {
		$http({
			method	:	"POST",
			url		:	"/removeFromCart",
			data	:	{
				"item"	:	item_id
			}
		}).then(function(data) {
			$scope.fetchCart();
			$scope.success.push("Item successfully removed from your cart!");
		}, function(error) {
			// TODO: Handle Error
		});
	};

	$scope.sellAnItem = function() {
		$window.location.href = "/sell";
	};

	$scope.homepageClicked = function() {
		$window.location.href = "/";
	};

	$scope.shop = function(item_id) {
		$window.location.href = "/viewItem?itemid=" + item_id;
	};

	$scope.search = function() {
		if($scope.searchString !== undefined && $scope.searchString.trim() !== "") {
			$window.location.href = "/?query=" + $scope.searchString;
		} else {
			$scope.outer_messages.push("Please enter an item name or seller name to search!");
		}
	};

	$scope.userProfile = function() {
		$window.location.href = "/"+$scope.user_name;
	};

	$scope.showUser = function(eBay_handle) {
		$window.location.href = "/"+eBay_handle;
	};

	$scope.shop = function(item_id) {
		$window.location.href = "/viewItem?itemid=" + item_id;
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

	$scope.fetchCart();
	$scope.fetchNotifications();



});
