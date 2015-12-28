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

-- Dumping structure for table wg_mscripts.dosage_instruction_changes
DROP TABLE IF EXISTS `dosage_instruction_changes`;
CREATE TABLE IF NOT EXISTS `dosage_instruction_changes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL DEFAULT '1' COMMENT 'FK to the clients table',
  `customer_prescription_id` int(10) unsigned NOT NULL COMMENT 'FK to the customer prescriptions table',
  `previous_sig_text` varchar(200) DEFAULT NULL COMMENT 'dosage instructions before updation',
  `updated_sig_text` varchar(200) DEFAULT NULL COMMENT 'dosage instructions after updation',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  PRIMARY KEY (`id`),
  KEY `FK_customer_prescriptions` (`customer_prescription_id`),
  KEY `FK_dosage_instruction_changes_client_id` (`client_id`),
  CONSTRAINT `FK_customer_prescriptions_customer_prescription_id` FOREIGN KEY (`customer_prescription_id`) REFERENCES `customer_prescriptions` (`id`),
  CONSTRAINT `FK_dosage_instruction_changes_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Mapping table for changed dosage instructions';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
