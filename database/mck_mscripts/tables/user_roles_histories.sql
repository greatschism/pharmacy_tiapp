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

-- Dumping structure for table wg_mscripts.user_roles_histories
DROP TABLE IF EXISTS `user_roles_histories`;
CREATE TABLE IF NOT EXISTS `user_roles_histories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'This field is the primary key of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `user_roles_id` int(10) unsigned NOT NULL COMMENT 'The id of the record in the user_roles table',
  `role_id` int(10) unsigned NOT NULL COMMENT 'FK to roles table',
  `user_id` int(10) unsigned DEFAULT NULL COMMENT 'FK to the users table',
  `valid_from` datetime NOT NULL COMMENT 'Date and time after which the record would be valid',
  `valid_to` datetime DEFAULT NULL COMMENT 'Date and time to which the record would be valid',
  `enabled` char(1) NOT NULL DEFAULT '1' COMMENT 'Flag to denote whether the address is enabled or not',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Table used to store history of roles of users and details';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
