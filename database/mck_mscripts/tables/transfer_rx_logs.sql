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

-- Dumping structure for table wg_mscripts.transfer_rx_logs
DROP TABLE IF EXISTS `transfer_rx_logs`;
CREATE TABLE IF NOT EXISTS `transfer_rx_logs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary key of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `action_log_id` int(10) unsigned DEFAULT NULL COMMENT 'Action log id of the reference record in action_logs table',
  `transmission_id` varchar(20) DEFAULT NULL COMMENT 'Unique ID for each transfer Rx Request',
  `customer_id` int(10) unsigned NOT NULL COMMENT 'customer ID of the user registered',
  `first_name` varchar(48) DEFAULT NULL COMMENT 'Encrypted "First Name" of the user',
  `last_name` varchar(48) DEFAULT NULL COMMENT 'Encrypted "Last Name" of the user',
  `customer_dob` varchar(16) DEFAULT NULL COMMENT 'Encrypted "Date of Birth" of the user',
  `mobile` varchar(45) DEFAULT NULL COMMENT 'Encrypted "Last Name" of the user',
  `email_address` varchar(256) DEFAULT NULL COMMENT 'Stores the email address of the user',
  `pref_pharmacy_id` int(10) unsigned NOT NULL COMMENT 'store id of pharmacy to which transfer rx request is sent',
  `orig_pharmacy_name` varchar(50) DEFAULT NULL COMMENT 'This field specifies name of the Store',
  `orig_pharmacy_phone` varchar(45) DEFAULT NULL COMMENT 'Phone number of the store',
  `rx_number` varchar(60) DEFAULT NULL COMMENT 'Rx Number requested for transfer',
  `rx_name` varchar(200) DEFAULT NULL COMMENT 'Rx Name requested for transfer',
  `image` char(1) NOT NULL COMMENT 'Flag which indicates whether tranfer rx request was by image or not',
  `transfer_all_rx` char(1) NOT NULL COMMENT 'Flag to specify customer requires all prescriptions to be transferred',
  `text_msg_active` char(1) NOT NULL COMMENT 'Flag to specify customer prefers to be signed up of text messaging',
  `transfer_mode` varchar(8) DEFAULT 'EMAIL' COMMENT 'Default mode of transfer rx request',
  `status` int(3) unsigned NOT NULL COMMENT 'Status of the Transfer Rx 1 -> Success, 0 -> Unknown Error, -1 -> Submit Failure, -2 -> Delivery Failure',
  `efax_error_code` int(10) unsigned DEFAULT NULL COMMENT 'Error code of the failure status from efax portal',
  `device_id` varchar(100) DEFAULT NULL,
  `created_by` varchar(10) NOT NULL COMMENT 'The id of the user who created the record',
  `created_at` datetime NOT NULL COMMENT 'The date and time, when the record was created',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'The id of the user who created or last updated the record',
  `updated_at` datetime NOT NULL COMMENT 'The date and time, when the record was created or last updated',
  PRIMARY KEY (`id`),
  KEY `FK_transfer_rx_logs_client_id` (`client_id`),
  KEY `FK_transfer_rx_logs_action_log_id` (`action_log_id`),
  KEY `FK_transfer_rx_logs_pref_pharmacy_id` (`pref_pharmacy_id`),
  KEY `FK_transfer_rx_logs_efax_error_code` (`efax_error_code`),
  CONSTRAINT `FK_transfer_rx_logs_action_log_id` FOREIGN KEY (`action_log_id`) REFERENCES `action_logs` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_transfer_rx_logs_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_transfer_rx_logs_efax_error_code` FOREIGN KEY (`efax_error_code`) REFERENCES `efax_status_codes` (`status_code`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_transfer_rx_logs_pref_pharmacy_id` FOREIGN KEY (`pref_pharmacy_id`) REFERENCES `stores` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Table to track all Transfer Rx API request and response status';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
