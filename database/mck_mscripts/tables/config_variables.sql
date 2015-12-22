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

-- Dumping structure for table wg_mscripts.config_variables
DROP TABLE IF EXISTS `config_variables`;
CREATE TABLE IF NOT EXISTS `config_variables` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `config_key` varchar(45) NOT NULL COMMENT 'The key to retrieve the config value',
  `config_value` varchar(200) NOT NULL COMMENT 'Value associated with a key',
  `created_at` varchar(45) NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(45) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` varchar(45) NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(45) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `visibility` char(1) NOT NULL DEFAULT '1' COMMENT 'Flag to hide from admin app',
  `config_label` varchar(500) DEFAULT NULL,
  `admin_guideline` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `i_config_key` (`config_key`),
  KEY `FK_config_variables_client_id` (`client_id`),
  CONSTRAINT `FK_config_variables_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Configuration variables';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
