-- --------------------------------------------------------
-- Host:                         carbonuat.cxivby4riwed.us-east-1.rds.amazonaws.com
-- Server version:               5.6.23-log - MySQL Community Server (GPL)
-- Server OS:                    Linux
-- HeidiSQL Version:             8.0.0.4396
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping structure for table wg_mscripts.devices
DROP TABLE IF EXISTS `devices`;
CREATE TABLE IF NOT EXISTS `devices` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `international_code` varchar(10) NOT NULL COMMENT 'International code for the phone number',
  `mobile_number` varchar(25) NOT NULL DEFAULT '0' COMMENT 'the mobile number of the user',
  `phone_make` varchar(60) DEFAULT NULL COMMENT 'Phone make',
  `carrier` varchar(60) DEFAULT NULL COMMENT 'Service provider of the phone',
  `verified` char(2) NOT NULL COMMENT 'Indicates whether the user is verified or not',
  `enable_prefix` int(10) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `customer_id` int(10) unsigned NOT NULL COMMENT 'FK to the customers table',
  `sms_token` varchar(100) DEFAULT NULL COMMENT 'Sms token for this user mobile',
  `shortcode` varchar(10) NOT NULL COMMENT 'Shortcode assigned to this user',
  `shortcode_username` varchar(45) NOT NULL COMMENT 'Username for shortcode',
  `shortcode_serviceid` varchar(20) NOT NULL COMMENT 'mblox shortcode serviceid',
  `verification_code` varchar(10) DEFAULT NULL COMMENT 'Verification code associated with the user signup process',
  `is_mobile_access_number` char(1) DEFAULT NULL COMMENT 'Flag that defines a proxy signup user',
  `access_code` varchar(10) DEFAULT NULL COMMENT 'Access code associated with the web self service login',
  `access_expiry` datetime DEFAULT NULL COMMENT 'Access code validity time',
  `failed_access_attempts` int(10) unsigned DEFAULT '0' COMMENT 'Number of failed access code attempts made by the user',
  `last_access_at` datetime DEFAULT NULL COMMENT 'The last time user entered the access code',
  PRIMARY KEY (`id`),
  KEY `FK_devices_1` (`customer_id`),
  KEY `i_international_code_mobile_number_vcode` (`international_code`,`mobile_number`,`verification_code`),
  KEY `i_sms_token` (`sms_token`(10)),
  KEY `FK_devices_client_id` (`client_id`),
  CONSTRAINT `FK_devices_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_devices_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='This table stores the mobile information of the user';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
