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

-- Dumping structure for table wg_mscripts.customer_sha_code
DROP TABLE IF EXISTS `customer_sha_code`;
CREATE TABLE IF NOT EXISTS `customer_sha_code` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary Key of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `customer_id` int(10) unsigned NOT NULL COMMENT 'FK to the customers table',
  `child_customer_id` int(10) unsigned NOT NULL COMMENT 'Child''s customer id',
  `hash_code` varchar(40) NOT NULL COMMENT 'SHA1 hash code.',
  `type` varchar(45) NOT NULL COMMENT 'Type: Email or Proxy',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(45) NOT NULL COMMENT 'User who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(45) NOT NULL COMMENT 'User who created or last updated this record',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `FK_customer_sha_code_child_customer_id_idx` (`child_customer_id`),
  KEY `FK_customer_sha_code_client_id_idx` (`client_id`),
  KEY `FK_customer_sha_code_customer_id_idx` (`customer_id`),
  CONSTRAINT `FK_customer_sha_code_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_customer_sha_code_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='This table stores the SHA1 hash codes.';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
