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

-- Dumping structure for table wg_mscripts.active_user_report_template_details
DROP TABLE IF EXISTS `active_user_report_template_details`;
CREATE TABLE IF NOT EXISTS `active_user_report_template_details` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'primary key to this table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `template_id` varchar(45) NOT NULL DEFAULT '' COMMENT 'foreign key to template table.',
  `active_user_category_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT 'foreign key to active user category.',
  `feature_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT 'foreign key to features table',
  `platform_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT 'foreign key to platforms table.',
  `min_times` int(11) NOT NULL,
  `query_number` int(10) NOT NULL COMMENT 'query number in template',
  `created_at` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'time and date of creation of this record',
  `created_by` varchar(45) NOT NULL DEFAULT '' COMMENT 'user who created this record',
  `updated_at` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'time and date this record is updated',
  `updated_by` varchar(45) NOT NULL DEFAULT '' COMMENT 'user who updated this record',
  PRIMARY KEY (`id`),
  KEY `FK_users_reports_template_2` (`feature_id`),
  KEY `FK_users_reports_template_3` (`active_user_category_id`),
  KEY `FK_users_reports_template_4` (`platform_id`),
  KEY `FK_active_user_report_template_details_client_id` (`client_id`),
  CONSTRAINT `FK_active_user_report_template_details_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='This table contains the template details of the template sav';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
