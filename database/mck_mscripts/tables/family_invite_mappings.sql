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

-- Dumping structure for table wg_mscripts.family_invite_mappings
DROP TABLE IF EXISTS `family_invite_mappings`;
CREATE TABLE IF NOT EXISTS `family_invite_mappings` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `client_id` int(11) unsigned NOT NULL,
  `parent_customer_id` int(11) unsigned NOT NULL COMMENT 'Parent Customer Id',
  `communication_mode` varchar(16) NOT NULL COMMENT 'Mode of invitation: SMS, EMAIL',
  `invite_details` blob NOT NULL COMMENT 'Encrypted contact details of invitee: Mobile Number or Email Address',
  `invite_sent_on` datetime NOT NULL COMMENT 'When was invitation sent',
  `is_declined` tinyint(4) NOT NULL DEFAULT '0' COMMENT 'Whether invitee has declined the invitation',
  `created_at` datetime DEFAULT NULL COMMENT 'When was this record created',
  `created_by` varchar(45) DEFAULT NULL COMMENT 'Who created this record',
  `updated_at` datetime DEFAULT NULL COMMENT 'When was this record last updated',
  `updated_by` varchar(45) DEFAULT NULL COMMENT 'By whom this record was last updated',
  `decline_count` tinyint(4) DEFAULT '0' COMMENT 'Number of decline attempts',
  `related_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_family_invite_mappings_client_id_idx` (`client_id`),
  KEY `FK_family_invite_mappings_parent_customer_id_idx` (`parent_customer_id`),
  KEY `IDX_family_invite_mappings_invite_details` (`invite_details`(256)),
  CONSTRAINT `FK_family_invite_mappings_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_family_invite_mappings_parent_customer_id` FOREIGN KEY (`parent_customer_id`) REFERENCES `customers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
