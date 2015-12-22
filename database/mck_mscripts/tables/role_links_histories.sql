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

-- Dumping structure for table wg_mscripts.role_links_histories
DROP TABLE IF EXISTS `role_links_histories`;
CREATE TABLE IF NOT EXISTS `role_links_histories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID for role link mapping histories. Primary key of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `role_links_id` int(10) unsigned NOT NULL COMMENT 'The id of the record in the role_links table',
  `link_id` int(10) unsigned NOT NULL COMMENT 'FK to links table',
  `role_id` int(10) unsigned NOT NULL COMMENT 'FK to roles table',
  `enabled` char(1) NOT NULL COMMENT 'This field indicates whether the role link  mapping is enabled or disabled',
  `valid_from` datetime NOT NULL COMMENT 'This field indicates the valid from date for the role link mapping',
  `valid_to` datetime DEFAULT NULL COMMENT 'This field indicates the valid to date for the role link mapping',
  `creation_date` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(45) NOT NULL COMMENT 'ID of the user who created this record',
  `last_updated_date` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(45) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Contains links previously associated with AC user roles';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
