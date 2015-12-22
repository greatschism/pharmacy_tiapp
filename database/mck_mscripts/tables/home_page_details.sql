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

-- Dumping structure for table wg_mscripts.home_page_details
DROP TABLE IF EXISTS `home_page_details`;
CREATE TABLE IF NOT EXISTS `home_page_details` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `client_id` int(10) unsigned NOT NULL COMMENT 'ID of the client table',
  `param_type` varchar(45) NOT NULL COMMENT 'Parameter Types',
  `param_version` varchar(45) NOT NULL COMMENT 'Version of the parameter type',
  `param_base_version` varchar(45) NOT NULL COMMENT 'Base version of the parameter type',
  `param_value` blob NOT NULL COMMENT 'Value of the JSON for the respective parameter type',
  `lang_code` varchar(10) NOT NULL DEFAULT 'en',
  PRIMARY KEY (`id`),
  KEY `FK_home_page_details_client_id_idx` (`client_id`),
  CONSTRAINT `FK_home_page_details_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Table which provides information about the home page of the client application';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
