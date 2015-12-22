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

-- Dumping structure for table wg_mscripts.refill_reminder_response_histories
DROP TABLE IF EXISTS `refill_reminder_response_histories`;
CREATE TABLE IF NOT EXISTS `refill_reminder_response_histories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `refill_reminder_response_id` int(10) unsigned NOT NULL COMMENT 'The id of the record in the refill_reminder_responses table',
  `communication_id` int(10) unsigned NOT NULL COMMENT 'Communications table ID of reminder',
  `mscripts_entity_id` varchar(60) NOT NULL COMMENT 'This field specifies the rxnum for the refill reminder history response record',
  `reminder_type` varchar(45) DEFAULT NULL COMMENT 'This field specifies the reminder type for the refill reminder history response record',
  `customer_id` int(10) unsigned NOT NULL COMMENT 'This field specifies the customer id for the refill reminder history response record',
  `refill_tiebreaker_code` char(1) NOT NULL COMMENT 'Tiebreaker Code for handling refill request for this prescription',
  `stop_tiebreaker_code` char(1) NOT NULL,
  `response` varchar(60) DEFAULT NULL COMMENT 'This field specifies the response text body for the refill reminder history response record',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `from` varchar(60) NOT NULL COMMENT 'This field specifies the from text body for the refill reminder history response record',
  `to` varchar(60) NOT NULL COMMENT 'This field specifies the to text body for the refill reminder history response record',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Table to store the history of the refill reminder responses';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
