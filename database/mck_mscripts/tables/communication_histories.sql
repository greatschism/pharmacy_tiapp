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

-- Dumping structure for table wg_mscripts.communication_histories
DROP TABLE IF EXISTS `communication_histories`;
CREATE TABLE IF NOT EXISTS `communication_histories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `customer_id` int(11) unsigned NOT NULL COMMENT 'FK to the customers table',
  `communication_id` int(10) unsigned NOT NULL COMMENT 'FK to the communications table',
  `mscripts_entity_id` varchar(300) DEFAULT NULL COMMENT 'Specifies entity ID (Could be doctor ID, RX ID, Store ID, Offer ID etc)',
  `message_text` text COMMENT 'Text of the message that was sent out',
  `from` varchar(75) NOT NULL COMMENT 'The from address/ number',
  `to` varchar(400) NOT NULL COMMENT 'Recipient address/ number',
  `anticipated_refill_date` datetime DEFAULT NULL COMMENT 'anticipated refill date in case this is a refill request',
  `message_status` varchar(45) NOT NULL COMMENT 'Status of the message sent',
  `api_msg_id` varchar(45) NOT NULL COMMENT 'The clickatell/ mblox ID obtained as confirmation of the message sent',
  `do_not_remind_further` char(1) DEFAULT NULL COMMENT 'Do not remind flag set by the user',
  `error_notes` text COMMENT 'Error notes, if any',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `appointment_date` datetime DEFAULT NULL COMMENT 'Appointment date in case of a Doctor appointment',
  `message_type` varchar(25) DEFAULT NULL COMMENT 'Indicates Email/ SMS',
  `tx_num` varchar(45) DEFAULT NULL COMMENT 'Tx Number associated with the message',
  `instance_id` varchar(800) DEFAULT NULL COMMENT 'This field stores the primary key of instance record associated',
  `number_of_messages` int(11) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `FK_ch_client_id` (`client_id`),
  KEY `FK_ch_comm_id` (`communication_id`),
  KEY `i_api_msg_id` (`api_msg_id`),
  KEY `i_created_at` (`created_at`),
  KEY `i_customer_id` (`customer_id`),
  KEY `i_messageType` (`message_type`),
  KEY `i_to` (`to`),
  CONSTRAINT `FK_comm_histories_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_comm_histories_comm_id` FOREIGN KEY (`communication_id`) REFERENCES `communications` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Stores the record of all messages sent out to the user';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
