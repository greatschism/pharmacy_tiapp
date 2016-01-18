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

-- Dumping structure for table wg_mscripts.gcm_devices
DROP TABLE IF EXISTS `gcm_devices`;
CREATE TABLE IF NOT EXISTS `gcm_devices` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `customer_id` int(10) unsigned NOT NULL COMMENT 'FK to the customers table',
  `device_type` varchar(40) DEFAULT NULL COMMENT 'Type of android device',
  `device_id` varchar(1000) DEFAULT NULL COMMENT 'Android device ID',
  `created_at` datetime DEFAULT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `updated_at` datetime DEFAULT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `created_by` varchar(10) DEFAULT NULL COMMENT 'ID of the user who created this record',
  `last_updated_by` varchar(10) DEFAULT NULL COMMENT 'ID of the user who created or last updated this record',
  PRIMARY KEY (`id`),
  KEY `FK_gcm_client_id` (`client_id`),
  KEY `FK_gcm_devices_1` (`customer_id`),
  CONSTRAINT `FK_gcm_devices_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_gcm_devices_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Table to store GCM device ID''s';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
