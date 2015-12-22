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

-- Dumping structure for table wg_mscripts.user_categories
DROP TABLE IF EXISTS `user_categories`;
CREATE TABLE IF NOT EXISTS `user_categories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'id of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `user_category` varchar(50) NOT NULL DEFAULT '' COMMENT 'Category to which a user belongs',
  `description` varchar(250) NOT NULL DEFAULT '' COMMENT 'description about the user category',
  `created_at` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL DEFAULT '' COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'This field specifies the  date and time when the record was created or updated',
  `updated_by` varchar(10) NOT NULL DEFAULT '' COMMENT 'ID of the user who created or last updated this record',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='This table contains the user type.';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
