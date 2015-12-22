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

-- Dumping structure for table wg_mscripts.rx_txn_history
DROP TABLE IF EXISTS `rx_txn_history`;
CREATE TABLE IF NOT EXISTS `rx_txn_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK for table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `customer_prescription_id` int(10) unsigned NOT NULL COMMENT 'FK to customer prescriptions table',
  `transaction_number` char(12) NOT NULL COMMENT 'Transaction identifier',
  `store_ncpdp_id` varchar(20) NOT NULL COMMENT 'Store NCPDP ID',
  `filled_date` datetime NOT NULL COMMENT 'Rx filled DATE TIME',
  `sold_date` datetime DEFAULT NULL COMMENT 'Sold DATE TIME',
  `drug_ndc` char(11) NOT NULL COMMENT 'National Drug Code',
  `drug_gpi` char(15) NOT NULL COMMENT 'Generic Product Identifier',
  `created_at` datetime NOT NULL COMMENT 'Record Creation Date-Time',
  `created_by` char(1) NOT NULL COMMENT 'Record creator',
  `updated_at` datetime NOT NULL COMMENT 'Last Updated Date-Time',
  `last_updated_by` char(1) NOT NULL COMMENT 'Last updated user',
  PRIMARY KEY (`id`),
  KEY `FK_prescription_refill_histories_1` (`customer_prescription_id`),
  KEY `i_customer_prescription_id` (`customer_prescription_id`),
  KEY `i_store_ncpdp_id` (`store_ncpdp_id`),
  KEY `i_transaction_number` (`transaction_number`),
  KEY `FK_rx_txn_history_client_id` (`client_id`),
  CONSTRAINT `FK_rx_txn_history_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Table to monitor prescription transaction history';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
