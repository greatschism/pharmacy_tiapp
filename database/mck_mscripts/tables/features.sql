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

-- Dumping structure for table wg_mscripts.features
DROP TABLE IF EXISTS `features`;
CREATE TABLE IF NOT EXISTS `features` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary key of the table.',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `feature_name` varchar(100) NOT NULL DEFAULT '' COMMENT 'The name of the feature.',
  `feature_by` varchar(45) NOT NULL DEFAULT '',
  `code` varchar(10) NOT NULL DEFAULT '' COMMENT 'The code name given for a feature. ',
  `api_name` varchar(50) NOT NULL DEFAULT '' COMMENT 'This field specifies the module functionality to which this feature code is associated. ',
  `description` varchar(500) NOT NULL DEFAULT '',
  `valid_from` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The date from which this feature will be applicable.',
  `valid_to` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The date till which the feature will be applicable. ',
  `enabled` char(1) NOT NULL DEFAULT '' COMMENT 'This field specifies whether the feature can be used or not. ',
  `created_at` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL DEFAULT '' COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'This field specifies the  date and time when the record was created or updated',
  `updated_by` varchar(10) NOT NULL DEFAULT '' COMMENT 'ID of the user who created or last updated this record',
  PRIMARY KEY (`id`),
  KEY `FK_features_client_id` (`client_id`),
  CONSTRAINT `FK_features_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 DELAY_KEY_WRITE=1 COMMENT='Stores the features related informations.';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
