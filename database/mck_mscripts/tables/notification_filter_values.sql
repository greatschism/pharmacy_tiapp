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

-- Dumping structure for table wg_mscripts.notification_filter_values
DROP TABLE IF EXISTS `notification_filter_values`;
CREATE TABLE IF NOT EXISTS `notification_filter_values` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary key of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `notif_id` int(10) unsigned DEFAULT NULL COMMENT 'Notification id, refers to id field in  notification table',
  `filter_id` int(10) unsigned DEFAULT NULL COMMENT 'Filter id refers to id of Notification_filters table',
  `value_list` varchar(4000) DEFAULT NULL COMMENT 'comma seperated value for the notification filter',
  `created_at` datetime DEFAULT NULL COMMENT 'Audit field for the time of creation of the record',
  `created_by` varchar(45) DEFAULT NULL COMMENT 'Audit field which contains the details of a user creating the record',
  `updated_at` datetime DEFAULT NULL COMMENT 'Audit field for updated time',
  `last_updated_by` varchar(45) DEFAULT NULL COMMENT 'Audit field which contains the details of a user who last updated the record',
  PRIMARY KEY (`id`),
  KEY `FK_notification_filter_values_filter_id` (`filter_id`),
  KEY `FK_notification_filter_values_notif_id` (`notif_id`),
  KEY `FK_notification_filter_values_client_id` (`client_id`),
  CONSTRAINT `FK_notification_filter_values_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_notification_filter_values_notification_id` FOREIGN KEY (`notif_id`) REFERENCES `notifications` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Maps notifications with notifications table; ';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
