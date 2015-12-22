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

-- Dumping structure for table wg_mscripts.customer_preferences
DROP TABLE IF EXISTS `customer_preferences`;
CREATE TABLE IF NOT EXISTS `customer_preferences` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `customer_id` int(10) unsigned NOT NULL COMMENT 'FK to the customers table',
  `show_rx_name` char(1) DEFAULT NULL COMMENT 'Flag to hide/show rx names in reminders',
  `send_refill_reminders` char(1) DEFAULT NULL COMMENT 'Flag to start/stop refill reminders',
  `send_dosage_reminders` char(1) DEFAULT NULL COMMENT 'Flag to start/stop dosage reminders',
  `send_offers` char(1) DEFAULT NULL COMMENT 'Flag to start/stop offer reminders',
  `mobile_app_active` char(1) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL COMMENT 'Unused field',
  `text_msg_active` char(1) DEFAULT NULL COMMENT 'Flag to start/stop SMS',
  `email_msg_active` char(1) DEFAULT '0' COMMENT 'Flag to start/stop Email',
  `onphone_reminder_active` char(1) DEFAULT NULL COMMENT 'Flag to enable/disable onphone reminders sync/APNS feature',
  `gcm_active` char(1) NOT NULL DEFAULT '0' COMMENT 'Flag to enable/disable onphone reminders for Android devices',
  `onphone_reminder_preference` varchar(5) DEFAULT NULL COMMENT 'This field stores the value of "number of days" field  entered by user for onphone reminders',
  `timezone` varchar(255) DEFAULT NULL COMMENT 'Timezone selected by the user',
  `send_reminder_hour` time DEFAULT NULL COMMENT 'Default reminder send hour selected by the user - for refill and doctor appointment reminders',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(45) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(45) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `send_doctor_reminders` char(1) DEFAULT NULL COMMENT 'Flag to start/stop doctor appointment reminders',
  `language` varchar(100) DEFAULT 'English' COMMENT 'Language selected by the user',
  `prescription_sort_order` varchar(30) NOT NULL COMMENT 'Indicates the sort order the cusomer wants his prescriptions.',
  `hide_expired_prescriptions` char(1) DEFAULT '0' COMMENT '0 indicates to show prescriptions till the prescription expiration limit and 1 indicates to hide the expired prescriptions',
  `hide_zero_refill_prescriptions` char(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_customer_id` (`customer_id`),
  KEY `FK_customer_preferences_client_id` (`client_id`),
  CONSTRAINT `FK_customer_preferences_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_customer_preferences_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Preferences saved by customer';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
