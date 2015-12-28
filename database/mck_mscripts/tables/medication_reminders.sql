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

-- Dumping structure for table wg_mscripts.medication_reminders
DROP TABLE IF EXISTS `medication_reminders`;
CREATE TABLE IF NOT EXISTS `medication_reminders` (
  `id` int(11) NOT NULL COMMENT 'Primary key of the table',
  `prescriptions_csv` varchar(45) NOT NULL COMMENT 'CSV of prescription''s table id column which signifies the list of prescriptions which are part of the reminder',
  `color_code` varchar(45) NOT NULL COMMENT 'Color code for the dosage reminder',
  `created_at` datetime NOT NULL COMMENT 'Record creation time',
  `created_by` varchar(45) NOT NULL COMMENT 'Record created by',
  `updated_at` datetime NOT NULL COMMENT 'Record updation time',
  `updated_by` varchar(45) NOT NULL COMMENT 'Record updated by',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='This table is used to store medication reminders';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
