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

-- Dumping structure for table wg_mscripts.dosage_reminder_mapping
DROP TABLE IF EXISTS `dosage_reminder_mapping`;
CREATE TABLE IF NOT EXISTS `dosage_reminder_mapping` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reminder_id` int(10) unsigned DEFAULT NULL,
  `prescription_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reminder_key_idx` (`reminder_id`),
  KEY `prescription_key_idx` (`prescription_id`),
  CONSTRAINT `prescription_key` FOREIGN KEY (`prescription_id`) REFERENCES `customer_prescriptions` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `reminder_key` FOREIGN KEY (`reminder_id`) REFERENCES `dosage_reminder_setups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
