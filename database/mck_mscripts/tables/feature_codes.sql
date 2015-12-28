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

-- Dumping structure for table wg_mscripts.feature_codes
DROP TABLE IF EXISTS `feature_codes`;
CREATE TABLE IF NOT EXISTS `feature_codes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'This is the primary key of the feature code table.',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `app_platform_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT 'This is the foreign key reference to app_platforms table to retrieve platform code.',
  `feature_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT 'This is the foreign key reference to feature table to retrieve the features.',
  `feature_code` varchar(50) DEFAULT NULL COMMENT 'This column contains the concatenated feature code.',
  `created_at` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL DEFAULT '' COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'This field specifies the  date and time when the record was created or updated',
  `updated_by` varchar(10) NOT NULL DEFAULT '' COMMENT 'ID of the user who created or last updated this record',
  PRIMARY KEY (`id`),
  KEY `FK_feature_codes_1` (`app_platform_id`),
  KEY `FK_feature_codes_2` (`feature_id`),
  KEY `FK_feature_codes_client_id` (`client_id`),
  CONSTRAINT `FK_feature_codes_1` FOREIGN KEY (`app_platform_id`) REFERENCES `app_platforms` (`id`),
  CONSTRAINT `FK_feature_codes_2` FOREIGN KEY (`feature_id`) REFERENCES `features` (`id`),
  CONSTRAINT `FK_feature_codes_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='This table contains the features code for all the features.';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
