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

-- Dumping structure for table wg_mscripts.error_codes
DROP TABLE IF EXISTS `error_codes`;
CREATE TABLE IF NOT EXISTS `error_codes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table.',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `error_code_type_id` int(10) unsigned NOT NULL COMMENT 'FK to the table error_code_type',
  `error_code` varchar(60) NOT NULL COMMENT 'The error code number of the error message. ',
  `error_message` varchar(400) DEFAULT NULL,
  `notes` varchar(255) DEFAULT 'a' COMMENT 'Additional information related to an error. If the value is ''a'', the error message should be shown as an alert message, else if the value is ''i'', the error message should be shown as an inline message.',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `error_resolution` varchar(500) NOT NULL COMMENT 'Predefined resolution for an error',
  `pdx_error_description` varchar(255) DEFAULT NULL COMMENT 'Error description as received from pdx for pdx service responses.',
  `lang_code` varchar(45) NOT NULL DEFAULT 'en',
  PRIMARY KEY (`id`),
  KEY `FK_error_codes_1` (`error_code_type_id`),
  KEY `i_error_code` (`error_code`),
  KEY `FK_error_codes_client_id` (`client_id`),
  KEY `FK_error_codes_lang_code_idx` (`lang_code`),
  CONSTRAINT `FK_error_codes_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_error_codes_error_code_type_id` FOREIGN KEY (`error_code_type_id`) REFERENCES `error_code_types` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_error_codes_lang_code` FOREIGN KEY (`lang_code`) REFERENCES `languages` (`lang_code`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Stores the list of error codes';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
