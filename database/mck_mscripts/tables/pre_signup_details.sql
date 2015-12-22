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

-- Dumping structure for table wg_mscripts.pre_signup_details
DROP TABLE IF EXISTS `pre_signup_details`;
CREATE TABLE IF NOT EXISTS `pre_signup_details` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `action_log_id` int(10) unsigned NOT NULL COMMENT 'FK to action_logs table',
  `customer_username` varchar(32) DEFAULT NULL COMMENT 'Customer user name',
  `email_address` varchar(256) NOT NULL COMMENT 'Email address of the customer',
  `customer_dob` varchar(16) NOT NULL COMMENT 'Customer Date of Birth',
  `error_notes` text COMMENT 'PDX error details if any',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `created_by` varchar(45) NOT NULL COMMENT 'ID of the user who created this record',
  `last_updated_by` varchar(45) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  PRIMARY KEY (`id`),
  KEY `i_action_log_id` (`action_log_id`),
  KEY `i_created_at` (`created_at`),
  KEY `i_customer_dob` (`customer_dob`),
  KEY `i_customer_username` (`customer_username`),
  KEY `i_email_address` (`email_address`),
  KEY `FK_pre_signup_details_client_id` (`client_id`),
  CONSTRAINT `FK_pre_signup_details_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Table to store details before signup process';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
