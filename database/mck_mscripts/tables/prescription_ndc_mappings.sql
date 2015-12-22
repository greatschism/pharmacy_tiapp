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

-- Dumping structure for table wg_mscripts.prescription_ndc_mappings
DROP TABLE IF EXISTS `prescription_ndc_mappings`;
CREATE TABLE IF NOT EXISTS `prescription_ndc_mappings` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK for prescription_ndc_mappings table',
  `client_id` int(11) unsigned NOT NULL COMMENT 'client identifier',
  `product_name` varchar(200) NOT NULL COMMENT 'prescription product name',
  `drug_ndc` char(11) NOT NULL COMMENT 'prescription drug ndc code',
  `created_at` datetime NOT NULL COMMENT 'UTC_TIMESTAMP of record creation',
  `created_by` varchar(10) NOT NULL COMMENT 'record created by',
  `updated_at` datetime NOT NULL COMMENT 'UTC_TIMESTAMP of record updation',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'record updated by',
  PRIMARY KEY (`id`),
  KEY `i_drug_ndc` (`drug_ndc`),
  KEY `FK_prescription_ndc_mappings_client_id` (`client_id`),
  CONSTRAINT `FK_prescription_ndc_mappings_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Table to contains prescription product name and drug ndc mappings';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
