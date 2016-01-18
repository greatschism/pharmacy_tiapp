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

-- Dumping structure for table wg_mscripts.family_account_mappings
DROP TABLE IF EXISTS `family_account_mappings`;
CREATE TABLE IF NOT EXISTS `family_account_mappings` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `client_id` int(11) unsigned NOT NULL,
  `parent_customer_id` int(11) unsigned NOT NULL COMMENT 'Parent Customer Id',
  `child_customer_id` int(11) unsigned NOT NULL COMMENT 'Child Customer Id',
  `link_status` tinyint(4) NOT NULL DEFAULT '1' COMMENT 'Whether account is linked or unlinked',
  `created_at` datetime DEFAULT NULL COMMENT 'When was this record created',
  `created_by` varchar(45) DEFAULT NULL COMMENT 'Who created this record',
  `updated_at` datetime DEFAULT NULL COMMENT 'When was this record last updated',
  `updated_by` varchar(45) DEFAULT NULL COMMENT 'By whom this record was last updated',
  `related_by` varchar(45) DEFAULT NULL,
  `is_mobile_associated` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_family_account_mappings_client_id_idx` (`client_id`),
  KEY `FK_family_account_mappings_parent_customer_id_idx` (`parent_customer_id`),
  KEY `FK_family_account_mappings_child_customer_id_idx` (`child_customer_id`),
  CONSTRAINT `FK_family_account_mappings_child_customer_id` FOREIGN KEY (`child_customer_id`) REFERENCES `customers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_family_account_mappings_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_family_account_mappings_parent_customer_id` FOREIGN KEY (`parent_customer_id`) REFERENCES `customers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
