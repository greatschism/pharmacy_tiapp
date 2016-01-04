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

-- Dumping structure for table wg_mscripts.feedback_devices
DROP TABLE IF EXISTS `feedback_devices`;
CREATE TABLE IF NOT EXISTS `feedback_devices` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `client_id` int(10) unsigned NOT NULL DEFAULT '1' COMMENT 'FK to the clients table',
  `customer_id` int(10) unsigned DEFAULT NULL COMMENT 'The customer id',
  `appload_id` int(10) unsigned NOT NULL COMMENT 'References the appload id',
  `device_id` varchar(100) DEFAULT NULL COMMENT 'Unique identifier for the device',
  `platform` varchar(3) DEFAULT NULL COMMENT 'The platform code ',
  `phone_app_version` varchar(10) DEFAULT NULL COMMENT 'The phone app version',
  `login_count` int(10) unsigned DEFAULT NULL COMMENT 'Column to track the number of times the customer has logged in ',
  `is_feedback_available` varchar(20) DEFAULT NULL COMMENT 'Flag to indicate if feedback is available for the customer on that device',
  `created_at` datetime DEFAULT NULL COMMENT 'Time of creation of record',
  `created_by` varchar(10) DEFAULT NULL COMMENT 'Record created by',
  `updated_at` datetime DEFAULT NULL COMMENT 'When was the record last updated at',
  `last_updated_by` varchar(10) DEFAULT NULL COMMENT 'Time of last updation of the record',
  PRIMARY KEY (`id`),
  KEY `i_appload_id` (`appload_id`),
  KEY `FK_feedback_devices_client_id` (`client_id`),
  KEY `FK_feedback_devices_customer_id` (`customer_id`),
  CONSTRAINT `FK_feedback_devices_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_feedback_devices_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
