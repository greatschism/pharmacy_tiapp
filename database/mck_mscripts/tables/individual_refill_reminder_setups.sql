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

-- Dumping structure for table wg_mscripts.individual_refill_reminder_setups
DROP TABLE IF EXISTS `individual_refill_reminder_setups`;
CREATE TABLE IF NOT EXISTS `individual_refill_reminder_setups` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table. ',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `refill_type` varchar(100) DEFAULT NULL COMMENT 'The refill type will be used to how refill can be done. ',
  `customer_id` int(10) unsigned NOT NULL COMMENT 'FK to the customers table',
  `communication_id` int(10) unsigned NOT NULL COMMENT 'FK to the communications table',
  `mscripts_entity_id` int(10) unsigned NOT NULL COMMENT 'Refill ID',
  `recurring` char(1) NOT NULL COMMENT 'This field will be used to predict whether the reminder is recurring in nature or not. ',
  `auto_refill` char(1) DEFAULT NULL COMMENT 'This field will be used to check wheter the refill can be done automatically. For future use',
  `send_reminder` char(1) NOT NULL COMMENT 'The boolean value will be used to check whether or not to send the reminder. ',
  `start_reminder_period` int(10) unsigned NOT NULL COMMENT 'The period after which the start reminder will be activated. ',
  `start_reminder_unit` varchar(10) NOT NULL COMMENT 'The unit associated with the start reminder. ',
  `number_of_reminders` int(10) unsigned NOT NULL COMMENT 'The total number of reminders. ',
  `reminder_frequency_period` int(10) unsigned DEFAULT NULL COMMENT 'The time period after which the reminder will be activated. ',
  `reminder_frequency_unit` varchar(10) NOT NULL COMMENT 'The unit used for the reminder frequency.',
  `additional_reminder` datetime DEFAULT NULL COMMENT 'This field will be used to hold the date time for the next reminder. ',
  `deleted_reminders` varchar(8000) DEFAULT NULL COMMENT 'The deleted refill reminder send dates are maintained here',
  `send_hour` time DEFAULT NULL COMMENT 'Time at which the reminder will be sent out',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `color_code` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_individual_refill_reminder_setups_client_id` (`client_id`),
  KEY `FK_individual_refill_reminder_setups_comm_id` (`communication_id`),
  KEY `FK_individual_refill_reminder_setups_customer_id` (`customer_id`),
  CONSTRAINT `FK_individual_refill_reminder_setups_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_individual_refill_reminder_setups_comm_id` FOREIGN KEY (`communication_id`) REFERENCES `communications` (`id`),
  CONSTRAINT `FK_individual_refill_reminder_setups_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Stores the refill reminder informations.';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
