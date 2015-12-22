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

-- Dumping structure for table wg_mscripts.customer_histories
DROP TABLE IF EXISTS `customer_histories`;
CREATE TABLE IF NOT EXISTS `customer_histories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `customer_id` int(10) unsigned NOT NULL COMMENT 'FK to the customers table',
  `customer_status` varchar(30) DEFAULT NULL COMMENT 'Indicates whether the user is verified or not',
  `email_address` varchar(256) DEFAULT NULL COMMENT 'Stores the encrypted email address of the user',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `first_login` varchar(1) NOT NULL DEFAULT '1' COMMENT 'Flag indicates whether the user has previously logged in to the on-phone applications/ wap',
  `session_id` varchar(100) DEFAULT NULL COMMENT 'The web logic session ID which is generated when the user logs into the application',
  `web_logic_session_id` varchar(100) DEFAULT NULL COMMENT 'NULL',
  `customer_dob` varchar(16) DEFAULT NULL COMMENT 'NULL',
  `customer_username` varchar(32) DEFAULT NULL COMMENT 'Stores the encrypted PDX UserName',
  `mscripts_token` varchar(100) DEFAULT NULL COMMENT 'mscripts generated token for asynchronous calls',
  `signup_mode` varchar(45) DEFAULT NULL COMMENT 'onphone/ store keeper signup mode',
  `zip_code` varchar(10) DEFAULT NULL COMMENT 'User zip code',
  `first_name` varchar(48) DEFAULT NULL COMMENT 'Encrypted "First Name" of the user',
  `last_name` varchar(48) DEFAULT NULL COMMENT 'Encrypted "Last Name" of the user',
  `is_minor` smallint(5) unsigned NOT NULL DEFAULT '0' COMMENT 'The field tells us whether the customer is a minor',
  `signup_store_id` int(10) unsigned DEFAULT NULL COMMENT 'Store Id of the store signup request received from',
  `ldap_person_id` varchar(45) DEFAULT NULL COMMENT 'User zip code',
  `patient_id` varchar(45) NOT NULL COMMENT 'User zip code',
  `email_verified` char(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='History table for customers';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
