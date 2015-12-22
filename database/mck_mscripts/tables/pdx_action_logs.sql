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

-- Dumping structure for table wg_mscripts.pdx_action_logs
DROP TABLE IF EXISTS `pdx_action_logs`;
CREATE TABLE IF NOT EXISTS `pdx_action_logs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `action_log_id` int(10) unsigned DEFAULT NULL COMMENT 'FK to action_logs table',
  `service_url_mapping_id` int(10) unsigned DEFAULT NULL COMMENT 'FK to service_url_mappings table',
  `pdx_request_body` blob COMMENT 'PDX request body',
  `pdx_response_body` blob COMMENT 'PDX response body',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `created_by` varchar(45) NOT NULL COMMENT 'ID of the user who created this record',
  `last_updated_by` varchar(45) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  PRIMARY KEY (`id`),
  KEY `pdx_action_logs_action_log_id` (`action_log_id`),
  KEY `pdx_action_logs_sevice_mapping_id` (`service_url_mapping_id`),
  KEY `FK_pdx_action_logs_client_id` (`client_id`),
  CONSTRAINT `FK_pdx_action_logs_action_log_id` FOREIGN KEY (`action_log_id`) REFERENCES `action_logs` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_pdx_action_logs_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_pdx_action_logs_service_url_mapping_id` FOREIGN KEY (`service_url_mapping_id`) REFERENCES `service_url_mappings` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Table to log pdx request/response';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
