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

-- Dumping structure for table wg_mscripts.active_user_report_templates
DROP TABLE IF EXISTS `active_user_report_templates`;
CREATE TABLE IF NOT EXISTS `active_user_report_templates` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'primary key of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT 'foreign key to users table',
  `template_name` varchar(100) NOT NULL DEFAULT '' COMMENT 'name of the template',
  `date_from` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'date from which the user requests.',
  `date_to` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'date to which the user requests.',
  `created_at` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'creation time',
  `created_by` varchar(45) NOT NULL DEFAULT '' COMMENT 'created by',
  `updated_at` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'update time.',
  `updated_by` varchar(45) NOT NULL DEFAULT '' COMMENT 'updated by.',
  PRIMARY KEY (`id`),
  KEY `FK_templates_1` (`user_id`),
  KEY `FK_templates_2` (`client_id`),
  CONSTRAINT `FK_templates_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_templates_2` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='this table contains all the templates saved by the user for ';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
