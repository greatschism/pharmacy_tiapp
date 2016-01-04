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

-- Dumping structure for table wg_mscripts.test_users
DROP TABLE IF EXISTS `test_users`;
CREATE TABLE IF NOT EXISTS `test_users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `customer_username` varchar(32) DEFAULT NULL COMMENT 'The PDX UserName',
  `first_name` varchar(48) DEFAULT NULL COMMENT 'Encrypted "First Name" of the user',
  `last_name` varchar(48) DEFAULT NULL COMMENT 'Encrypted "Last Name" of the user',
  `customer_dob` varchar(16) DEFAULT NULL COMMENT 'Encrypted "Date of Birth" of the user',
  `valid_from` datetime NOT NULL COMMENT 'This field indicates the valid from date for test user',
  `valid_to` datetime NOT NULL COMMENT 'This field indicates the valid from date for test user',
  `is_transaction_monitor_user` varchar(1) NOT NULL DEFAULT '1' COMMENT 'This field whether the user is transaction monitor user',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  PRIMARY KEY (`id`),
  KEY `FK_tu_client_id` (`client_id`),
  CONSTRAINT `FK_test_users_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='This table contains test users who are used for monitoring services in mscripts';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
