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

-- Dumping structure for table wg_mscripts.infrastructure_service_histories
DROP TABLE IF EXISTS `infrastructure_service_histories`;
CREATE TABLE IF NOT EXISTS `infrastructure_service_histories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary key of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `infrastructure_services_id` int(10) unsigned DEFAULT NULL COMMENT 'The id of record in infrastructure_services table',
  `service_id` varchar(45) NOT NULL COMMENT 'ID of the infrastructure service',
  `service_name` varchar(45) NOT NULL COMMENT 'Name of the infrastructure service',
  `service_desc` varchar(45) NOT NULL COMMENT 'Description of the infrastructure service',
  `status_of_service` char(1) DEFAULT NULL COMMENT 'This field indicates whether the infrastructure service is up or down',
  `time_of_update` datetime DEFAULT NULL COMMENT 'This field indicates the time of update of  status  of the infrastructure service',
  `message` varchar(45) DEFAULT NULL COMMENT 'The field contains the informational message regarding the infrastructure service',
  `created_by` varchar(45) NOT NULL COMMENT 'ID of the user who created this record',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(45) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Infrastructure services and their status histories are avail';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
