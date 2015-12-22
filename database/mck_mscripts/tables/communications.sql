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

-- Dumping structure for table wg_mscripts.communications
DROP TABLE IF EXISTS `communications`;
CREATE TABLE IF NOT EXISTS `communications` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `communication_name` varchar(60) NOT NULL COMMENT 'Name as to be displayed on the admin screen',
  `sms_text` varchar(300) DEFAULT NULL COMMENT 'Text to be messaged to the user',
  `sms_base_text_length` int(10) unsigned DEFAULT NULL COMMENT 'Length of the static content in the SMS',
  `sms_placeholder_lengths` varchar(250) NOT NULL COMMENT 'Lenght(s) of various place holders in the text as a CSV',
  `email_subject` varchar(255) DEFAULT NULL COMMENT 'Subject line of the e-mail to be send',
  `email_body` varchar(8000) DEFAULT NULL COMMENT 'Content of the email to be send',
  `email_from` varchar(60) DEFAULT NULL COMMENT 'From address for the email',
  `email_bcc` varchar(300) DEFAULT NULL COMMENT 'This field containts BCC addresses, if any, as a CSV ',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `onphone_text` varchar(300) DEFAULT NULL COMMENT 'Text for APNS messages',
  `onphone_placeholder_lengths` varchar(250) DEFAULT NULL COMMENT 'Placeholder length for APNS messages',
  PRIMARY KEY (`id`),
  KEY `FK_comm_client_id` (`client_id`),
  KEY `i_communication_name` (`communication_name`),
  CONSTRAINT `FK_communications_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Stores Communication Templates';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
