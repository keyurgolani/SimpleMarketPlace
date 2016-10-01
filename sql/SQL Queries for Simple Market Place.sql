CREATE SCHEMA `simple_market_place` ;
use `simple_market_place`;
--------------------------------------------------------------
CREATE TABLE `simple_market_place`.`user_account` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(50) NOT NULL,
  `f_name` varchar(50) NOT NULL,
  `l_name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `secret` varchar(50) NOT NULL,
  `last_login` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
);
--------------------------------------------------------------
CREATE TABLE `simple_market_place`.`cc_details` (
  `cc_id` int(11) NOT NULL AUTO_INCREMENT,
  `cc_number` bigint(20) NOT NULL,
  `exp_date` date NOT NULL,
  `cc_cvv` int(50) NOT NULL,
  `f_name` varchar(50) NOT NULL,
  `l_name` varchar(50) NOT NULL,
  `card_holder` int(11) DEFAULT NULL,
  PRIMARY KEY (`cc_id`),
  KEY `card_holder` (`card_holder`),
  CONSTRAINT `fk_cc_holder` FOREIGN KEY (`card_holder`) REFERENCES `user_account` (`user_id`)
);
---------------------------------------------------------------
  CREATE TABLE `simple_market_place`.`user_profile` (
  `profile_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_handle` varchar(50) NOT NULL,
  `dob` date NULL,
  `contact` bigint(10) UNSIGNED NULL,
  `user` int(11) DEFAULT NULL,
  PRIMARY KEY (`profile_id`),
  KEY `user` (`user`),
  CONSTRAINT `fk_user_profile` FOREIGN KEY (`user`) REFERENCES `user_account` (`user_id`)
);
----------------------------------------------------------------
CREATE TABLE `simple_market_place`.`location_details` (
  `location_id` int(11) NOT NULL AUTO_INCREMENT,
  `st_address` varchar(50) NOT NULL,
  `apt` varchar(10) NOT NULL,
  `city` varchar(50) NOT NULL,
  `state` varchar(50) NOT NULL,
  `country` varchar(50) NOT NULL,
  `zip` bigint(10) NOT NULL,
  `profile` int(11) DEFAULT NULL,
  PRIMARY KEY (`location_id`),
  KEY `profile` (`profile`),
  CONSTRAINT `fk_profile_location` FOREIGN KEY (`profile`) REFERENCES `user_profile` (`profile_id`)
);
-----------------------------------------------------------------
CREATE TABLE `simple_market_place`.`item_details` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `item_name` varchar(50) NOT NULL,
  `item_description` varchar(400) NOT NULL,
  PRIMARY KEY (`item_id`)
  );
-----------------------------------------------------------------
CREATE TABLE `simple_market_place`.`sale_details` (
  `sale_id` int(11) NOT NULL AUTO_INCREMENT,
  `seller` int(11) DEFAULT NULL,
  `item` int(11) DEFAULT NULL,
  `condition` varchar(50) NOT NULL,
  `desc` VARCHAR(400) NULL,
  `is_bid` TINYINT(1) NOT NULL,
  `sale_qty` INT NOT NULL,
  PRIMARY KEY (`sale_id`),
  KEY `seller` (`seller`),
  KEY `item` (`item`),
  CONSTRAINT `fk_sale_seller` FOREIGN KEY (`seller`) REFERENCES `user_account` (`user_id`),
  CONSTRAINT `fk_sale_item` FOREIGN KEY (`item`) REFERENCES `item_details` (`item_id`)
);
-----------------------------------------------------------------
CREATE TABLE `simple_market_place`.`bid_details` (
  `bid_id` int(11) NOT NULL AUTO_INCREMENT,
  `sale` int(11) DEFAULT NULL,
  `bidder` int(11) DEFAULT NULL,
  `bid_amount` FLOAT NOT NULL,
  `bid_qty` INT NOT NULL,
  `bid_time` TIMESTAMP(6) NOT NULL,
  PRIMARY KEY (`bid_id`),
  KEY `sale` (`sale`),
  KEY `bidder` (`bidder`),
  CONSTRAINT `fk_bid_sale` FOREIGN KEY (`sale`) REFERENCES `sale_details` (`sale_id`),
  CONSTRAINT `fk_bid_bidder` FOREIGN KEY (`bidder`) REFERENCES `user_account` (`user_id`)
);
-----------------------------------------------------------------
CREATE TABLE `simple_market_place`.`txn_details` (
  `txn_id` int(11) NOT NULL AUTO_INCREMENT,
  `sale` int(11) DEFAULT NULL,
  `buyer` int(11) DEFAULT NULL,
  `transaction_price` FLOAT NOT NULL,
  `txn_qty` INT NOT NULL,
  PRIMARY KEY (`txn_id`),
  KEY `sale` (`sale`),
  KEY `buyer` (`buyer`),
  CONSTRAINT `fk_txn_sale` FOREIGN KEY (`sale`) REFERENCES `sale_details` (`sale_id`),
  CONSTRAINT `fk_txn_buyer` FOREIGN KEY (`buyer`) REFERENCES `user_account` (`user_id`)
);
------------------------------------------------------------------
CREATE TABLE `simple_market_place`.`cart_details` (
  `cart_item_id` int(11) NOT NULL AUTO_INCREMENT,
  `user` int(11) DEFAULT NULL,
  `sale_item` int(11) DEFAULT NULL,
  `cart_qty` INT NOT NULL,
  PRIMARY KEY (`cart_item_id`),
  KEY `user` (`user`),
  KEY `sale_item` (`sale_item`),
  CONSTRAINT `fk_cart_owner` FOREIGN KEY (`user`) REFERENCES `user_account` (`user_id`),
  CONSTRAINT `fk_cart_sale_item` FOREIGN KEY (`sale_item`) REFERENCES `sale_details` (`sale_id`)
);