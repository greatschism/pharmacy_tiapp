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

-- Dumping structure for table wg_mscripts.error_detail_histories
DROP TABLE IF EXISTS `error_detail_histories`;
CREATE TABLE IF NOT EXISTS `error_detail_histories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `error_details_id` int(10) unsigned DEFAULT NULL COMMENT 'The id of the record in error_details table',
  `error_code_id` int(10) unsigned DEFAULT NULL COMMENT 'FK to the error_codes table',
  `error_source` varchar(200) DEFAULT NULL COMMENT 'Field to identify error source',
  `other_error_code` varchar(800) DEFAULT NULL COMMENT 'Field to store any other error code',
  `other_error_message` text COMMENT 'Field to track any other error message',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(45) DEFAULT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(45) DEFAULT NULL COMMENT 'ID of the user who created or last updated this record',
  `error_detail` text COMMENT 'Stores the details of an error',
  `error_severity` varchar(50) DEFAULT NULL COMMENT 'Field to track the error severity',
  `action_log_id` int(10) unsigned DEFAULT NULL COMMENT 'FK to the action_logs table',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Error record histories table';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
