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

-- Dumping structure for table wg_mscripts.device_histories
DROP TABLE IF EXISTS `device_histories`;
CREATE TABLE IF NOT EXISTS `device_histories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `customer_id` int(10) unsigned NOT NULL COMMENT 'Customer ID of the user',
  `international_code` varchar(10) NOT NULL COMMENT 'International code for the phone number',
  `mobile_number` varchar(25) NOT NULL COMMENT 'the mobile number of the user',
  `phone_make` varchar(60) DEFAULT NULL COMMENT 'Phone make',
  `carrier` varchar(60) DEFAULT NULL COMMENT 'Service provider of the phone',
  `verified` char(1) NOT NULL COMMENT 'Indicates whether the user is verified or not',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `device_id` int(10) unsigned DEFAULT NULL COMMENT 'Deleted device ID',
  `sms_token` varchar(100) DEFAULT NULL COMMENT 'Sms token for this user mobile',
  `shortcode` varchar(10) NOT NULL COMMENT 'Shortcode assigned to this user',
  `shortcode_username` varchar(45) NOT NULL COMMENT 'Username for shortcode',
  `shortcode_serviceid` varchar(20) NOT NULL COMMENT 'mblox shortcode serviceid',
  `verification_code` varchar(10) DEFAULT NULL COMMENT 'Verification code associated with the user signup process',
  `is_mobile_access_number` char(1) DEFAULT NULL COMMENT 'Flag that defines a proxy signup user',
  `enable_prefix` char(1) NOT NULL DEFAULT '0' COMMENT 'Enable prefix flag',
  `access_code` varchar(10) DEFAULT NULL COMMENT 'Access code associated with the web self service login',
  `access_expiry` datetime DEFAULT NULL COMMENT 'Access code validity time',
  `failed_access_attempts` int(10) unsigned DEFAULT NULL COMMENT 'Number of failed access code attempts made by the user',
  `last_access_at` datetime DEFAULT NULL COMMENT 'The last time user entered the access code',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='History table for devices';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
