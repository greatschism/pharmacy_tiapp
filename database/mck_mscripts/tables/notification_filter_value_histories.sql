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

-- Dumping structure for table wg_mscripts.notification_filter_value_histories
DROP TABLE IF EXISTS `notification_filter_value_histories`;
CREATE TABLE IF NOT EXISTS `notification_filter_value_histories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary key of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `notification_filter_value_id` int(10) unsigned NOT NULL COMMENT 'The id of the record in notification_filter_values the table',
  `notif_id` varchar(45) DEFAULT NULL COMMENT 'Notification id, refers to id field in  notification table',
  `filter_id` varchar(45) DEFAULT NULL COMMENT 'Filter id refers to id of Notification_filters table',
  `value_list` varchar(4000) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL COMMENT 'comma seperated value for the notification filter',
  `created_at` datetime DEFAULT NULL COMMENT 'Audit field for the time of creation of the record',
  `created_by` varchar(45) DEFAULT NULL COMMENT 'Audit field which contains the details of a user creating the record',
  `updated_at` datetime DEFAULT NULL COMMENT 'Audit field for updated time',
  `last_updated_by` varchar(45) DEFAULT NULL COMMENT 'Audit field which contains the details of a user who last updated the record',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Stores the notification filter value table records history';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
