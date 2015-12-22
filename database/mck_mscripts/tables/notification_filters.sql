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

-- Dumping structure for table wg_mscripts.notification_filters
DROP TABLE IF EXISTS `notification_filters`;
CREATE TABLE IF NOT EXISTS `notification_filters` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `filter_name` varchar(45) NOT NULL COMMENT 'Filter name represents the condition for filtering',
  `filter_display_name` varchar(100) DEFAULT NULL COMMENT 'Display name for notification filter',
  `enabled` char(1) DEFAULT NULL COMMENT 'Indicate that the filter is valid',
  `filterTypeFlag` char(1) NOT NULL DEFAULT '1' COMMENT 'Indicates whether the filter type should be used in query builder or not',
  `customer_select_sql` varchar(1000) DEFAULT NULL COMMENT 'Represents the sql to be used for filtering the customer records based on the filter criteria',
  `filter_sql` varchar(1000) DEFAULT NULL COMMENT 'SQL to fetch the master list for the filter',
  `created_at` datetime DEFAULT NULL COMMENT 'Audit field representing the created time',
  `created_by` varchar(45) DEFAULT NULL COMMENT 'Audit field for identifiying the creator of the record',
  `updated_at` datetime DEFAULT NULL COMMENT 'Audit field for the last updated time',
  `last_updated_by` varchar(45) DEFAULT NULL COMMENT 'Audit field for identifying the  last person who updated the record',
  PRIMARY KEY (`id`),
  KEY `FK_notification_filters_1` (`client_id`),
  CONSTRAINT `FK_notification_filters_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Master table containing details of all the notifications fil';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
