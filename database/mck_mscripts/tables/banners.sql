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

-- Dumping structure for table wg_mscripts.banners
DROP TABLE IF EXISTS `banners`;
CREATE TABLE IF NOT EXISTS `banners` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Id of the banner',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `name` varchar(100) NOT NULL COMMENT 'Name of the banner',
  `description` varchar(200) DEFAULT NULL COMMENT 'Description for the banner',
  `mobile_image_url` varchar(250) DEFAULT NULL COMMENT 'Location of banner image for mobile application',
  `mobile_action_url` varchar(250) DEFAULT NULL COMMENT 'Action on click of banner image on mobile application',
  `desktop_image_url` varchar(250) DEFAULT NULL COMMENT 'Location of banner image for desktop application',
  `desktop_action_url` varchar(250) DEFAULT NULL COMMENT 'Action on click of banner image on desktop application',
  `priority` int(10) unsigned NOT NULL COMMENT 'Priority of the banner',
  `valid_from` datetime NOT NULL COMMENT 'Valid from date for the banner',
  `valid_to` datetime DEFAULT NULL COMMENT 'Valid to date for the banner',
  `is_confirmed` char(1) NOT NULL COMMENT 'Flag to indicate if the banner is confirmed',
  `is_deleted` char(1) NOT NULL COMMENT 'Flag to indicate if the banner is confirmed',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the date when the banner was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the date when the banner was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who last updated this record',
  `platform` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_banners_client_id` (`client_id`),
  CONSTRAINT `FK_banners_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Table to store banner related data';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
