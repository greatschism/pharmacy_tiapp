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

-- Dumping structure for table wg_mscripts.notification_instances
DROP TABLE IF EXISTS `notification_instances`;
CREATE TABLE IF NOT EXISTS `notification_instances` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `notification_id` int(10) unsigned NOT NULL COMMENT 'FK to the notifications table',
  `send_date` datetime NOT NULL COMMENT 'Date on which the communication is sent',
  `customer_id` int(10) unsigned NOT NULL COMMENT 'FK to the customers table',
  `error_notes` varchar(255) DEFAULT NULL COMMENT 'Error notes',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `send_sms` char(1) NOT NULL DEFAULT '0' COMMENT 'Indicates send status of SMS; 0 - Not to be sent,1 - To be Sent,2 - Successfully sent',
  `send_email` char(1) NOT NULL DEFAULT '0' COMMENT 'Indicates send status of email message; 0 - Not to be sent,1 - To be Sent,2 - Successfully sent',
  `send_apns` char(1) NOT NULL DEFAULT '0' COMMENT 'Indicates send status of APNS message; 0 - Not to be sent,1 - To be Sent,2 - Successfully sent',
  `send_gcms` char(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_notification_instances_client_id` (`client_id`),
  KEY `FK_notification_instances_customer_id` (`customer_id`),
  KEY `FK_notification_instances_notification_id` (`notification_id`),
  CONSTRAINT `FK_notification_instances_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_notification_instances_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_notification_instances_notification_id` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Stores instances of all notifications';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
