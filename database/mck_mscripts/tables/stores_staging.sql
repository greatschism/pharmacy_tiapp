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

-- Dumping structure for table wg_mscripts.stores_staging
DROP TABLE IF EXISTS `stores_staging`;
CREATE TABLE IF NOT EXISTS `stores_staging` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `store_ncpdp_id` varchar(50) DEFAULT NULL COMMENT 'Store ncpdpid',
  `store_name` varchar(50) DEFAULT NULL COMMENT 'Store name',
  `address_line_1` varchar(100) DEFAULT NULL COMMENT 'Store address line 1',
  `city` varchar(45) DEFAULT NULL COMMENT 'Store city',
  `state_or_province` varchar(45) DEFAULT NULL COMMENT 'Store state or province',
  `zip` varchar(45) DEFAULT NULL COMMENT 'Store zip',
  `phone_number` varchar(45) DEFAULT NULL COMMENT 'Store phone number',
  `fax_number` varchar(45) DEFAULT NULL COMMENT 'Store fax number',
  `longitude` varchar(45) DEFAULT NULL COMMENT 'Store longitude',
  `latitude` varchar(45) DEFAULT NULL COMMENT 'Store latitude',
  `created_at` datetime DEFAULT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(45) DEFAULT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime DEFAULT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(45) DEFAULT NULL COMMENT 'ID of the user who created or last updated this record',
  `timezone` varchar(50) DEFAULT NULL COMMENT 'The timezone associated with the store',
  `hours` varchar(4000) DEFAULT NULL COMMENT 'The store working hours',
  `isvalid` char(1) NOT NULL COMMENT 'Field to identify valid/invalid stores',
  `eps_enabled` char(1) DEFAULT NULL COMMENT 'EPS enabled store',
  PRIMARY KEY (`id`),
  KEY `FK_stores_staging_client_id` (`client_id`),
  CONSTRAINT `FK_stores_staging_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Temporary table to hold values of stores';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
