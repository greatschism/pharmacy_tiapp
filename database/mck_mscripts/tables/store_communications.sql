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

-- Dumping structure for table wg_mscripts.store_communications
DROP TABLE IF EXISTS `store_communications`;
CREATE TABLE IF NOT EXISTS `store_communications` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'This field is the primary key of the table.',
  `client_id` int(10) unsigned NOT NULL DEFAULT '1' COMMENT 'FK to the clients table',
  `store_id` int(10) unsigned DEFAULT NULL COMMENT 'FK to the stores table',
  `store_identifier` varchar(10) DEFAULT NULL,
  `region` varchar(45) DEFAULT NULL,
  `group` varchar(45) DEFAULT NULL,
  `district` varchar(45) DEFAULT NULL,
  `email_primary` varchar(200) DEFAULT NULL COMMENT 'Stores the primary email address of the store',
  `email_additional` varchar(300) DEFAULT NULL COMMENT 'Stores the additional email address of the store, if any, as a CSV ',
  `delay_in_wcr` varchar(20) DEFAULT NULL COMMENT 'This is the time the store takes from filled state to will call ready state',
  `fax_primary` varchar(200) DEFAULT NULL COMMENT 'Stores the primary Fax number of the store',
  `fax_additional` varchar(200) DEFAULT NULL COMMENT 'Stores the additional Fax number of the store',
  `transfer_rx_mode` varchar(200) DEFAULT 'email' COMMENT 'Transfer Rx mode of EMAIL or FAX is stored',
  `created_at` datetime DEFAULT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(45) DEFAULT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime DEFAULT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(45) DEFAULT NULL COMMENT 'ID of the user who created or last updated this record',
  PRIMARY KEY (`id`),
  KEY `FK_store_communications_client_id` (`client_id`),
  KEY `FK_store_communications_store_id` (`store_id`),
  CONSTRAINT `FK_store_communications_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_store_communications_store_id` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Communication Details regarding pharmacy stores';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
