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

-- Dumping structure for table wg_mscripts.tell_a_friend
DROP TABLE IF EXISTS `tell_a_friend`;
CREATE TABLE IF NOT EXISTS `tell_a_friend` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary key of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `customer_id` int(10) unsigned NOT NULL COMMENT 'ID of the customer',
  `device_id` varchar(200) DEFAULT NULL COMMENT 'ID of the device used by thte customer',
  `email_id` varchar(500) NOT NULL COMMENT 'Email id(s) of the person(s) to whom the email is sent',
  `created_at` datetime NOT NULL COMMENT 'Date at which the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who crested the record',
  `updated_at` datetime NOT NULL COMMENT 'Date at which the record was last updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the usert who last updated the record',
  PRIMARY KEY (`id`),
  KEY `FK_tell_a_friend_client_id` (`client_id`),
  KEY `FK_tell_a_friend_customer_id` (`customer_id`),
  CONSTRAINT `FK_tell_a_friend_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_tell_a_friend_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='This table tracks the application referral, when a user refers the application to his/her friend.';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
