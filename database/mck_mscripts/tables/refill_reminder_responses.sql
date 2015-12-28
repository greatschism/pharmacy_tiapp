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

-- Dumping structure for table wg_mscripts.refill_reminder_responses
DROP TABLE IF EXISTS `refill_reminder_responses`;
CREATE TABLE IF NOT EXISTS `refill_reminder_responses` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `communication_id` int(10) unsigned NOT NULL COMMENT 'FK to the communications table',
  `mscripts_entity_id` varchar(60) NOT NULL COMMENT 'This field specifies the rxnum of the response record',
  `reminder_type` varchar(45) DEFAULT NULL COMMENT 'This field specifies the reminder type of the response record',
  `customer_id` int(10) unsigned NOT NULL COMMENT 'FK to the customers table',
  `refill_tiebreaker_code` char(1) NOT NULL COMMENT 'Tiebreaker Code for handling refill request for this prescription',
  `stop_tiebreaker_code` char(1) NOT NULL COMMENT 'Tiebreaker Code for handling stop request for this prescription',
  `from` varchar(60) NOT NULL COMMENT 'This field specifies the from text body of the response record',
  `to` varchar(60) NOT NULL COMMENT 'This field specifies the to text body of the response record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `response` varchar(60) DEFAULT NULL COMMENT 'This field specifies the response text body of the response record',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  PRIMARY KEY (`id`),
  KEY `FK_refill_reminder_responses_1` (`communication_id`),
  KEY `FK_refill_reminder_responses_2` (`customer_id`),
  KEY `i_mscripts_entity_id` (`mscripts_entity_id`),
  KEY `i_to` (`to`),
  KEY `FK_refill_reminder_responses_client_id` (`client_id`),
  CONSTRAINT `FK_refill_reminder_responses_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_refill_reminder_responses_comm_id` FOREIGN KEY (`communication_id`) REFERENCES `communications` (`id`),
  CONSTRAINT `FK_refill_reminder_responses_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Stores the refill reminder responses.';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
