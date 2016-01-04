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

-- Dumping structure for table wg_mscripts.ext_req_handler_audit_histories
DROP TABLE IF EXISTS `ext_req_handler_audit_histories`;
CREATE TABLE IF NOT EXISTS `ext_req_handler_audit_histories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `ext_req_handler_audits_id` int(10) unsigned DEFAULT NULL COMMENT 'The id of record in ext_req_handler_audits table',
  `api_name` varchar(100) DEFAULT NULL COMMENT 'Name of the API invoked by external system',
  `request_body` longtext COMMENT 'Field to log the request body',
  `response_code` varchar(100) DEFAULT NULL COMMENT 'Response code sent to the invoking system',
  `error_detail_id` int(10) unsigned DEFAULT NULL COMMENT 'FK to the error_details table',
  `response` text COMMENT 'Response sent to the invoking system',
  `added_to_queue` char(1) DEFAULT NULL COMMENT 'Flag indicating retry logic enabled/disabled',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `created_by` varchar(45) NOT NULL COMMENT 'ID of the user who created this record',
  `last_updated_by` varchar(45) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `action_log_id` int(10) unsigned DEFAULT NULL COMMENT 'FK to the action_logs table',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Table to log external request handler API calls histories.';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
