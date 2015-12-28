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

-- Dumping structure for table wg_mscripts.millennial_media
DROP TABLE IF EXISTS `millennial_media`;
CREATE TABLE IF NOT EXISTS `millennial_media` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `page` varchar(30) NOT NULL,
  `placement_id` varchar(10) DEFAULT NULL,
  `app_platform_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_millenial_media_app_platform_id` (`app_platform_id`),
  KEY `FK_millennial_media_client_id` (`client_id`),
  CONSTRAINT `FK_millenial_media_app_platform_id` FOREIGN KEY (`app_platform_id`) REFERENCES `app_platforms` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_millennial_media_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
