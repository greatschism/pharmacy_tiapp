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

-- Dumping structure for table wg_mscripts.action_log_histories
DROP TABLE IF EXISTS `action_log_histories`;
CREATE TABLE IF NOT EXISTS `action_log_histories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary Key of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `action_logs_id` int(10) unsigned DEFAULT NULL COMMENT 'The id of record in action logs table',
  `customer_id` int(10) NOT NULL COMMENT 'FK to the customers table',
  `feature_code` varchar(10) NOT NULL COMMENT 'Feature Code of the Action',
  `mscripts_entity_id` varchar(60) DEFAULT NULL COMMENT 'Specifies entity ID (Could be doctor ID, RX ID, Store ID, Offer ID etc)',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `action_type` varchar(20) DEFAULT NULL COMMENT 'To identify a GET or POST request',
  `error_detail_id` int(10) unsigned DEFAULT NULL COMMENT 'FK to the error_details table',
  `appload_id` int(10) unsigned DEFAULT NULL COMMENT 'phone_usage_catalogs ID',
  PRIMARY KEY (`id`),
  KEY `FK_action_log_histories_client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Histories table for Audits';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
