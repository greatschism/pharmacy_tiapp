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

-- Dumping structure for table wg_mscripts.stores
DROP TABLE IF EXISTS `stores`;
CREATE TABLE IF NOT EXISTS `stores` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'This field is the primary key of the table.',
  `client_id` int(10) unsigned NOT NULL DEFAULT '1' COMMENT 'FK to the clients table',
  `store_ncpdp_id` varchar(50) DEFAULT NULL COMMENT 'NCPDP Identifier, as provided by PDX',
  `store_name` varchar(200) DEFAULT NULL,
  `address_line_1` varchar(100) DEFAULT NULL COMMENT 'Address line 1 of the store address',
  `city` varchar(45) DEFAULT NULL COMMENT 'City of store address',
  `state_or_province` varchar(45) DEFAULT NULL COMMENT 'State or Province of store address',
  `zip` varchar(45) DEFAULT NULL COMMENT 'Zip of store address',
  `phone_number` varchar(45) DEFAULT NULL COMMENT 'Phone number of the store',
  `fax_number` varchar(45) DEFAULT NULL COMMENT 'Fax number of the store',
  `latitude` varchar(45) DEFAULT NULL COMMENT 'Latitude of the store address',
  `longitude` varchar(45) DEFAULT NULL COMMENT 'Longitude of the store address',
  `timezone` varchar(50) DEFAULT NULL COMMENT 'The timezone associated with the store',
  `hours` varchar(4000) DEFAULT NULL COMMENT 'The store working hours',
  `updated_at` datetime DEFAULT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(45) DEFAULT NULL COMMENT 'ID of the user who created or last updated this record',
  `four_square_id` varchar(30) DEFAULT NULL COMMENT 'Four square id of the pharmacy',
  `isvalid` char(1) NOT NULL DEFAULT '1' COMMENT 'Field to identify valid/invalid stores',
  `eps_enabled` char(1) DEFAULT '0' COMMENT 'EPS enabled store',
  `sort_key` int(10) DEFAULT NULL COMMENT 'stores order for sorting of stores',
  `min_time_no_md_call` varchar(45) DEFAULT NULL COMMENT 'The quantity of the minimum time required to refill an IVR order without a physician it in.',
  `min_time_interval` varchar(45) DEFAULT NULL COMMENT 'The interval (qualifier) of the MinTimeNoMDCall field either “minutes”, “hours”, or “days”',
  `created_at` datetime DEFAULT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(45) DEFAULT NULL COMMENT 'ID of the user who created this record',
  PRIMARY KEY (`id`),
  KEY `i_store_ncpdp_id` (`store_ncpdp_id`),
  KEY `FK_stores_client_id` (`client_id`),
  CONSTRAINT `FK_stores_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Details regarding pharmacy stores';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
