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

-- Dumping structure for table wg_mscripts.user_message_histories
DROP TABLE IF EXISTS `user_message_histories`;
CREATE TABLE IF NOT EXISTS `user_message_histories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'This field is the primary key of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `user_message_id` int(10) unsigned DEFAULT NULL COMMENT 'ID of the user_messages record',
  `communication_id` int(10) unsigned DEFAULT NULL COMMENT 'FK to the communications table',
  `from` varchar(45) NOT NULL COMMENT 'Number of the message sender',
  `to` varchar(45) NOT NULL COMMENT 'Recipients phone number',
  `customer_id` int(10) unsigned DEFAULT NULL COMMENT 'FK to the customers table',
  `message_text` varchar(200) NOT NULL COMMENT 'Text content of the message',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `action_log_id` int(10) unsigned NOT NULL COMMENT 'FK to the action_logs table',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Table used to store the historical data of messages sent by the user and relate';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
