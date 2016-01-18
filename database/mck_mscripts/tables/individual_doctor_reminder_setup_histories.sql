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

-- Dumping structure for table wg_mscripts.individual_doctor_reminder_setup_histories
DROP TABLE IF EXISTS `individual_doctor_reminder_setup_histories`;
CREATE TABLE IF NOT EXISTS `individual_doctor_reminder_setup_histories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `individual_doctor_reminder_setup_id` int(10) unsigned NOT NULL COMMENT 'Id of the individual_doctor_reminder_setups table',
  `customer_doctor_id` int(10) NOT NULL COMMENT 'FK of the customer_doctors table.',
  `customer_id` int(10) unsigned NOT NULL COMMENT 'FK to the customers table',
  `communication_id` int(10) unsigned NOT NULL COMMENT 'FK to the communications table',
  `send_reminder` char(1) NOT NULL COMMENT 'Boolean value indicating whether or not to send the reminder',
  `start_reminder_period` int(10) unsigned NOT NULL COMMENT 'This field describes after how much time the reminder should start.',
  `start_reminder_unit` varchar(10) NOT NULL COMMENT 'This field basically describes the unit for reminder i.e. days, hours etc',
  `number_of_reminders` int(10) unsigned NOT NULL COMMENT 'This field specifies the number of reminders',
  `reminder_frequency_period` int(10) unsigned DEFAULT NULL COMMENT 'This field specifies that how many times in a unit described by reminder_frequency_unit field the reminder should be used',
  `reminder_frequency_unit` varchar(10) NOT NULL COMMENT 'The unit of the reminder frequency',
  `appointment_date` datetime DEFAULT NULL COMMENT 'The appointment date with the doctor.',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) DEFAULT NULL COMMENT 'ID of the user who created or last updated this record',
  `send_hour` time DEFAULT NULL COMMENT 'Time when reminder will be sent out',
  PRIMARY KEY (`id`),
  KEY `FK_individual_doctor_reminder_setups_1` (`communication_id`),
  KEY `FK_individual_doctor_reminder_setups_2` (`customer_id`),
  KEY `FK_individual_doctor_reminder_setups_3` (`customer_doctor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Stores the archived doctor reminder setups.';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
