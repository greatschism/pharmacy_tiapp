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

-- Dumping structure for table wg_mscripts.master_refill_reminder_setups
DROP TABLE IF EXISTS `master_refill_reminder_setups`;
CREATE TABLE IF NOT EXISTS `master_refill_reminder_setups` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary Key of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `customer_id` int(10) unsigned NOT NULL COMMENT 'FK to the customers table',
  `refill_type` varchar(100) DEFAULT NULL COMMENT 'Refill Type',
  `communication_id` int(10) unsigned NOT NULL COMMENT 'FK to the communications table',
  `recurring` char(1) NOT NULL COMMENT 'Flag to set it Recurring',
  `start_reminder_period` int(10) unsigned DEFAULT NULL COMMENT 'Value of the Reminder Unit',
  `start_reminder_unit` varchar(10) NOT NULL COMMENT 'Unit of the Reminder',
  `number_of_reminders` int(10) unsigned DEFAULT NULL COMMENT 'Number of Reminders',
  `reminder_frequency_period` int(10) unsigned DEFAULT NULL COMMENT 'Value of the Frequency Unit',
  `reminder_frequency_unit` varchar(10) DEFAULT NULL COMMENT 'Unit of the Reminder Frequency',
  `send_hour` time DEFAULT NULL COMMENT 'Default Hour to send Reminder',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  PRIMARY KEY (`id`),
  KEY `FK_master_refill_reminder_setups_1` (`communication_id`),
  KEY `FK_master_refill_reminder_setups_2` (`customer_id`),
  KEY `FK_master_refill_reminder_setups_client_id` (`client_id`),
  CONSTRAINT `FK_master_refill_reminder_setups_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_master_refill_reminder_setups_communication_id` FOREIGN KEY (`communication_id`) REFERENCES `communications` (`id`),
  CONSTRAINT `FK_master_refill_reminder_setups_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Stores default Refill Reminder for Customers';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
