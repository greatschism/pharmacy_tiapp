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

-- Dumping structure for table wg_mscripts.service_url_mappings
DROP TABLE IF EXISTS `service_url_mappings`;
CREATE TABLE IF NOT EXISTS `service_url_mappings` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID of the service url mappings. Primary key of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `service_code` varchar(45) DEFAULT NULL COMMENT 'This field contains the code associated with the service',
  `service_description` varchar(200) DEFAULT NULL COMMENT 'This field contains the description of the service ',
  `service_url` varchar(200) DEFAULT NULL COMMENT 'This field contains the URL of the  service.',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(45) NOT NULL COMMENT 'ID of the user who created or last updated this record.',
  `created_by` varchar(45) NOT NULL COMMENT 'ID of the user who created this record',
  `service_status` char(1) NOT NULL COMMENT 'This field indicates the status of the service.',
  PRIMARY KEY (`id`),
  KEY `FK_service_url_mappings_client_id` (`client_id`),
  CONSTRAINT `FK_service_url_mappings_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='PDX api urls and details';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
