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

-- Dumping structure for table wg_mscripts.bulk_rx_pickup_instance_histories
DROP TABLE IF EXISTS `bulk_rx_pickup_instance_histories`;
CREATE TABLE IF NOT EXISTS `bulk_rx_pickup_instance_histories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `bulk_rx_pickup_instance_id` int(10) unsigned NOT NULL COMMENT 'The id of the record in bulk_rx_pickup_instances table',
  `rx_num` varchar(100) DEFAULT NULL COMMENT 'The customer prescription number',
  `orig_store_ncpdp` varchar(100) DEFAULT NULL COMMENT 'The original store ncpdp id related to a prescription',
  `filled_store_ncpdp` varchar(100) DEFAULT NULL COMMENT 'The store ncpdp id at which the prescription has been refilled',
  `refill_date` datetime DEFAULT NULL COMMENT 'The date when the prescription has been filled',
  `refill_status` varchar(100) DEFAULT NULL COMMENT 'Refill status retrieved from the feed',
  `tx_num` varchar(45) DEFAULT NULL COMMENT 'The transaction number used for the prescription refill process',
  `error_notes` text COMMENT 'Field to note the errors',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `customer_prescription_id` int(10) unsigned DEFAULT NULL COMMENT 'FK to the customer_prescriptions  table',
  `send_date` datetime DEFAULT NULL COMMENT 'The datetime at which the reminder will be sent',
  `customer_id` int(10) unsigned DEFAULT NULL COMMENT 'FK to the customers table',
  `created_by` varchar(45) NOT NULL COMMENT 'ID of the user who created this record',
  `last_updated_by` varchar(45) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `send_sms` char(1) NOT NULL COMMENT 'This field specifies the send sms flag for the reminder record',
  `send_email` char(1) NOT NULL COMMENT 'This field specifies the send email flag for the reminder record',
  `send_apns` char(1) NOT NULL COMMENT 'This field specifies the send apns flag for the reminder record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `first_send_date` datetime DEFAULT NULL COMMENT 'The datetime at which the first reminder is sent',
  `prescription_code` varchar(3) DEFAULT NULL COMMENT 'RxPickup reminder STOP code',
  `final_reminder` char(1) DEFAULT NULL COMMENT 'Is final reminder',
  `communication_id` int(11) DEFAULT NULL COMMENT 'Rx Pickup communication ID',
  PRIMARY KEY (`id`),
  KEY `FK_brpih_client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Processed Bulk Rx Pickup Records';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
