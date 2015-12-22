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

-- Dumping structure for table wg_mscripts.rx_refills
DROP TABLE IF EXISTS `rx_refills`;
CREATE TABLE IF NOT EXISTS `rx_refills` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `customer_prescription_id` int(10) unsigned DEFAULT NULL COMMENT 'FK to customer prescriptions table',
  `store_ncpdp_id` varchar(20) DEFAULT NULL COMMENT 'Store ncpdpid where the refill has been requested',
  `request_source` varchar(60) NOT NULL COMMENT 'This field specifies the request source for the rxrefill record',
  `refill_request_date` datetime NOT NULL COMMENT 'This field specifies the refill request date for the rxrefill record',
  `refill_type` varchar(60) NOT NULL COMMENT 'This field specifies the refill type for the rxrefill record',
  `refill_completion_date` datetime DEFAULT NULL COMMENT 'This field specifies the refill completion date for the rxrefill record',
  `anticipated_refill_date` datetime DEFAULT NULL COMMENT 'Anticipated refill date for a prescription',
  `refill_promised_date` datetime DEFAULT NULL COMMENT 'Refill promised date promised by the store',
  `notes` varchar(2000) DEFAULT NULL COMMENT 'Field to note any additional information(IVR/Email refill)',
  `rx_number` varchar(60) DEFAULT NULL COMMENT 'The RX Number of the prescription',
  `refill_status` varchar(60) NOT NULL COMMENT 'Field that denotes the refill order status',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(45) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(45) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  PRIMARY KEY (`id`),
  KEY `i_cust_presc_id_store_ncpdp_id` (`customer_prescription_id`,`store_ncpdp_id`),
  KEY `FK_rx_refills_client_id` (`client_id`),
  CONSTRAINT `FK_rx_refills_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Table to store the rx refill requests made by a customer';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
