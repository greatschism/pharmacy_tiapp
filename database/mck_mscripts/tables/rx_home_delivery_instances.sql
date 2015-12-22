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

-- Dumping structure for table wg_mscripts.rx_home_delivery_instances
DROP TABLE IF EXISTS `rx_home_delivery_instances`;
CREATE TABLE IF NOT EXISTS `rx_home_delivery_instances` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'This field is the primary key of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `customer_prescription_id` int(10) unsigned NOT NULL COMMENT 'FK to the customer_prescriptions table',
  `error_notes` text COMMENT 'This field specifies the error notes for the rx home delivery instance',
  `created_at` datetime DEFAULT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(45) DEFAULT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime DEFAULT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(45) DEFAULT NULL COMMENT 'ID of the user who created or last updated this record',
  PRIMARY KEY (`id`),
  KEY `FK_rx_home_delivery_instances_client_id` (`client_id`),
  KEY `FK_rx_home_delivery_instances_customer_prescription_id` (`customer_prescription_id`),
  CONSTRAINT `FK_rx_home_delivery_instances_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_rx_home_delivery_instances_customer_prescription_id` FOREIGN KEY (`customer_prescription_id`) REFERENCES `customer_prescriptions` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
