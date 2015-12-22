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

-- Dumping structure for table wg_mscripts.handler_action_log_histories
DROP TABLE IF EXISTS `handler_action_log_histories`;
CREATE TABLE IF NOT EXISTS `handler_action_log_histories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary key of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `handler_action_logs_id` int(10) unsigned DEFAULT NULL COMMENT 'The id of record in handler_action_logs table',
  `appload_id` int(10) unsigned DEFAULT NULL COMMENT 'Appload id for the record',
  `source` varchar(10) DEFAULT NULL COMMENT 'Source of the API request',
  `action_log_id` int(10) unsigned DEFAULT NULL COMMENT 'Action log id of the reference record in action_logs table',
  `session_id` varchar(100) DEFAULT NULL COMMENT 'Session id of the action',
  `mscripts_token` varchar(100) DEFAULT NULL COMMENT 'Mscripts token of the action',
  `handler_request` blob COMMENT 'API request body',
  `handler_response` mediumblob COMMENT 'API response body',
  `created_by` varchar(10) NOT NULL COMMENT 'The id of the user who created the record',
  `created_at` datetime NOT NULL COMMENT 'The date and time, when the record was created',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'The id of the user who created or last updated the record',
  `updated_at` datetime NOT NULL COMMENT 'The date and time, when the record was created or last updated',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Table for handler_action_logs histories';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
