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

-- Dumping structure for table wg_mscripts.notification_instance_histories
DROP TABLE IF EXISTS `notification_instance_histories`;
CREATE TABLE IF NOT EXISTS `notification_instance_histories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `notification_instance_id` int(10) unsigned NOT NULL COMMENT 'The id of the record in the notification_instances table',
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='History table for notification instances';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
