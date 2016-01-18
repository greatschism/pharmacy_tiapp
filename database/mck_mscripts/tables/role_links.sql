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

-- Dumping structure for table wg_mscripts.role_links
DROP TABLE IF EXISTS `role_links`;
CREATE TABLE IF NOT EXISTS `role_links` (
  `role_id` int(11) unsigned NOT NULL COMMENT 'FK to roles table',
  `link_id` int(11) unsigned NOT NULL COMMENT 'FK to links table',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` int(11) unsigned NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime DEFAULT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `updated_by` int(11) unsigned DEFAULT NULL COMMENT 'ID of the user who created or last updated this record',
  PRIMARY KEY (`role_id`,`link_id`),
  KEY `FK_role_links_link_id` (`link_id`),
  CONSTRAINT `FK_role_links_link_id` FOREIGN KEY (`link_id`) REFERENCES `links` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_role_links_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Stores all accessible links for each role in Admin Console';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
