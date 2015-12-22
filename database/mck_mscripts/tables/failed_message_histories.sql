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

-- Dumping structure for table wg_mscripts.failed_message_histories
DROP TABLE IF EXISTS `failed_message_histories`;
CREATE TABLE IF NOT EXISTS `failed_message_histories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `failed_message_id` int(10) unsigned NOT NULL COMMENT 'Id of the failed_messages table',
  `customer_id` int(11) DEFAULT NULL COMMENT 'FK to the customers table',
  `communication_id` int(10) unsigned DEFAULT NULL COMMENT 'FK to the communications table',
  `mscripts_entity_id` varchar(60) DEFAULT NULL COMMENT 'Specifies entity ID (Could be doctor ID, RX ID, Store ID, Offer ID etc)',
  `message_text` text COMMENT 'Text of the message that was sent out',
  `from` varchar(75) DEFAULT NULL COMMENT 'The from address/ number',
  `to` varchar(75) DEFAULT NULL COMMENT 'Recipient address/ number',
  `anticipated_refill_date` datetime DEFAULT NULL COMMENT 'anticipated refill date in case this is a refill request',
  `message_status` varchar(45) DEFAULT NULL COMMENT 'Status of the message sent',
  `batch_id` varchar(45) DEFAULT NULL COMMENT 'The clickatell/ mblox ID obtained as confirmation of the message sent',
  `error_notes` text COMMENT 'Error notes, if any',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `appointment_date` datetime DEFAULT NULL COMMENT 'Appointment date in case of a Doctor appointment',
  `message_type` varchar(25) DEFAULT NULL COMMENT 'Indicates Email/ SMS',
  `tx_num` varchar(45) DEFAULT NULL COMMENT 'Tx Number associated with the message',
  `mblox_req_result` varchar(10) DEFAULT NULL COMMENT 'Request result code returned by mBlox',
  `mblox_notif_result` varchar(10) DEFAULT NULL COMMENT 'Notification result code returned by mBlox',
  `mblox_sub_result` varchar(10) DEFAULT NULL COMMENT 'Subscriber result code returned by mBlox',
  `mblox_retry` varchar(10) DEFAULT NULL COMMENT 'Rety code returned by mBlox',
  `mblox_req_result_text` varchar(800) DEFAULT NULL COMMENT 'Request result text returned by mBlox',
  `mblox_notif_result_text` varchar(800) DEFAULT NULL COMMENT 'Notification result text returned by mBlox',
  `mblox_sub_result_text` varchar(800) DEFAULT NULL COMMENT 'Subscriber result text returned by mBlox',
  `action_log_id` int(10) unsigned DEFAULT NULL COMMENT 'Action log ID related to this record',
  `shortcode_username` varchar(45) DEFAULT NULL COMMENT 'Username for shortcode',
  `shortcode_serviceid` varchar(20) DEFAULT NULL COMMENT 'mblox shortcode serviceid',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='History table for Failed Messages';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
