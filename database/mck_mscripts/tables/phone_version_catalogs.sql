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

-- Dumping structure for table wg_mscripts.phone_version_catalogs
DROP TABLE IF EXISTS `phone_version_catalogs`;
CREATE TABLE IF NOT EXISTS `phone_version_catalogs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary Key of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `phone_platform` varchar(50) NOT NULL COMMENT 'Phone Platform i.e. iPhone, Blackberry etc',
  `phone_version` varchar(10) NOT NULL COMMENT 'A version code attached with every phone app release',
  `is_supported` char(1) DEFAULT NULL COMMENT 'whether the phone version is still supported or not',
  `features` varchar(500) DEFAULT NULL COMMENT 'Rich text for the features added for this version',
  `upgrade_message` varchar(500) DEFAULT NULL COMMENT 'Upgrade message to be displayed to the user',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `upgrade_url` varchar(300) DEFAULT NULL COMMENT 'Ugrade URL for the application',
  `download_url` varchar(300) DEFAULT NULL COMMENT 'Download URL for WAP',
  `feedback_url` varchar(300) DEFAULT NULL COMMENT 'Feedback URL to post feedback',
  `mobile_platform_id` int(10) unsigned NOT NULL COMMENT 'Foreign key to mobile platform',
  PRIMARY KEY (`id`),
  KEY `i_phone_version_phone_platform` (`phone_version`,`phone_platform`),
  KEY `FK_phone_version_catalogs_client_id` (`client_id`),
  KEY `FK_phone_version_catalogs_mobile_platform_id` (`mobile_platform_id`),
  CONSTRAINT `FK_phone_version_catalogs_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_phone_version_catalogs_mobile_platform_id` FOREIGN KEY (`mobile_platform_id`) REFERENCES `app_platforms` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Maps the handler and the phone app versions';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
