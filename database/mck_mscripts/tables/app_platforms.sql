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

-- Dumping structure for table wg_mscripts.app_platforms
DROP TABLE IF EXISTS `app_platforms`;
CREATE TABLE IF NOT EXISTS `app_platforms` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `name` varchar(45) NOT NULL COMMENT 'Name of the platform',
  `code` varchar(3) NOT NULL COMMENT 'Code used to represent the platform',
  `app_type` char(2) NOT NULL COMMENT 'Flag to indicate if it is mobile, desktop or handler platform',
  `is_millennial_media_enabled` char(1) NOT NULL,
  `is_enabled` char(1) NOT NULL COMMENT 'Flag to indicate whether app type is enabled for the client',
  `created_at` datetime NOT NULL COMMENT 'Date when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created the record',
  `updated_at` datetime NOT NULL COMMENT 'Date when last updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'foreign key to clients table',
  PRIMARY KEY (`id`),
  KEY `FK_app_platforms_client_id` (`client_id`),
  CONSTRAINT `FK_app_platforms_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
