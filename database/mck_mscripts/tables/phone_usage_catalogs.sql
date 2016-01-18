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

-- Dumping structure for table wg_mscripts.phone_usage_catalogs
DROP TABLE IF EXISTS `phone_usage_catalogs`;
CREATE TABLE IF NOT EXISTS `phone_usage_catalogs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary Key of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `customer_id` int(10) unsigned NOT NULL DEFAULT '1' COMMENT 'FK to customers table',
  `device_id` varchar(200) DEFAULT NULL COMMENT 'Unique identifier for the device',
  `phone_model` varchar(200) DEFAULT NULL COMMENT 'Phone Model e.g.BlackBerry® 8703e smartphone',
  `phone_OS` varchar(100) DEFAULT NULL COMMENT 'Phone OS e.g.Blackberry OS v4.2.1.110',
  `phone_platform` varchar(100) NOT NULL COMMENT 'Two letter identifier for the phone platform',
  `phone_app_version` varchar(10) DEFAULT NULL COMMENT 'Phone App version',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `network_provider` varchar(100) DEFAULT NULL COMMENT 'The network provider of the customer',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  PRIMARY KEY (`id`),
  KEY `i_created_at` (`created_at`),
  KEY `FK_phone_usage_catalogs_client_id` (`client_id`),
  KEY `FK_phone_usage_catalogs_customer_id` (`customer_id`),
  CONSTRAINT `FK_phone_usage_catalogs_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_phone_usage_catalogs_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Table to log phone versions and usage';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
