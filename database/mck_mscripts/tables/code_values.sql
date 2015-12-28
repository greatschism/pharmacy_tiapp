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

-- Dumping structure for table wg_mscripts.code_values
DROP TABLE IF EXISTS `code_values`;
CREATE TABLE IF NOT EXISTS `code_values` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary Key of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `code_tables_id` int(10) unsigned NOT NULL COMMENT 'FK to the code tables table',
  `code_value` varchar(100) NOT NULL COMMENT 'Value of the Item in the Group',
  `code_display` varchar(100) NOT NULL COMMENT 'Display text of the Item of the Group',
  `valid_from` datetime NOT NULL COMMENT 'Item Valid From Date',
  `valid_to` datetime DEFAULT NULL COMMENT 'Item Valid To Date',
  `enabled` char(1) NOT NULL DEFAULT '1' COMMENT 'Flag to enable this Item',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `sort_order` int(10) unsigned NOT NULL COMMENT 'Sort order value',
  PRIMARY KEY (`id`),
  KEY `FK_code_values_1` (`code_tables_id`),
  KEY `FK_cv_client_id` (`client_id`),
  KEY `i_code_value` (`code_value`),
  CONSTRAINT `FK_code_values_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_code_values_code_tables_id` FOREIGN KEY (`code_tables_id`) REFERENCES `code_tables` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Stores the configurable items of the groups';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
