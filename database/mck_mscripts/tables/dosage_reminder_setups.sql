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

-- Dumping structure for table wg_mscripts.dosage_reminder_setups
DROP TABLE IF EXISTS `dosage_reminder_setups`;
CREATE TABLE IF NOT EXISTS `dosage_reminder_setups` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `customer_id` int(10) unsigned NOT NULL COMMENT 'FK to the customers table',
  `communication_id` int(10) unsigned NOT NULL COMMENT 'FK to the communications table',
  `mscripts_entity_id` int(10) unsigned NOT NULL COMMENT 'FK to the customer_prescriptions table',
  `dosage_reminder_end_date` datetime DEFAULT NULL COMMENT 'Date on which the dosage reminder stops',
  `frequency` varchar(30) NOT NULL COMMENT 'Frequency of reminders, can be Monthly/ Weekly, Daily or AsNeeded',
  `send_hour` varchar(500) NOT NULL COMMENT 'Time at which the reminders need to be sent',
  `day_of_month` varchar(500) DEFAULT NULL COMMENT 'Day of month on which the reminder needs to be sent out in case the frequency is monthly',
  `day_of_year` varchar(500) DEFAULT NULL COMMENT 'Day of year on which the reminder needs to be sent out in case the frequency is yearly',
  `day_of_week` varchar(500) DEFAULT NULL COMMENT 'Day of the week on which the reminder needs to be sent out in case the frequency is weekly',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `additional_message` varchar(100) DEFAULT NULL COMMENT 'Field to store any additional message to be sent along with the dosage reminder',
  `send_reminder` char(1) NOT NULL COMMENT 'Flag to identify if reminders are turned on',
  `expiry_type` char(1) DEFAULT NULL COMMENT 'Type of expiry(0-When Rx Expires/1-After specific date/2-After n days)',
  `color_code` varchar(45) NOT NULL,
  `period` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_dosage_reminder_setups_1` (`communication_id`),
  KEY `FK_dosage_reminder_setups_2` (`customer_id`),
  KEY `FK_mscripts_entity_id` (`mscripts_entity_id`),
  KEY `FK_dosage_reminder_setups_client_id` (`client_id`),
  CONSTRAINT `FK_dosage_reminder_setups_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_dosage_reminder_setups_communication_id` FOREIGN KEY (`communication_id`) REFERENCES `communications` (`id`),
  CONSTRAINT `FK_dosage_reminder_setups_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Dosage reminder settings for user';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
